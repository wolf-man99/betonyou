import { supabase } from './supabase'
import { creditOnWin, platformCut, PLATFORM_FEE } from './revenue'
import { addDays, todayISO, isPast } from './dates'

const FREQ_DIVISOR = { daily: 1, every2: 2, weekly: 7 }

export function computeCheckinsRequired(durationDays, frequency) {
  const divisor = FREQ_DIVISOR[frequency] || 1
  return Math.max(1, Math.floor(durationDays / divisor))
}

export async function createBet({userId,goalType,description,amount,durationDays,frequency,platformFeePaid,razorpayOrderId,razorpayPaymentId,}) {
  const start = todayISO()
  const end = addDays(start, durationDays)
  const checkinsRequired = computeCheckinsRequired(durationDays, frequency)
  const dbFrequency = frequency === 'weekly' ? 'weekly' : 'daily'

  const { data, error } = await supabase
    .from('bets')
    .insert({
      user_id: userId,
      goal_type: goalType,
      description,
      amount,
      duration_days: durationDays,
      checkin_frequency: dbFrequency,
      start_date: start,
      end_date: end,
      status: 'active',
      platform_fee_paid: platformFeePaid,
      checkins_required: checkinsRequired,
      checkins_completed: 0,
      razorpay_order_id: razorpayOrderId || null,
      razorpay_payment_id: razorpayPaymentId || null,
    })
    .select()
    .single()

  if (!error && data) {
    const ledger = [
      {
        user_id: userId,
        type: 'bet_placed',
        amount: -amount,
        description: `Stake locked: ${description}`,
        bet_id: data.id,
      },
    ]
    if (platformFeePaid) {
      ledger.push({
        user_id: userId,
        type: 'platform_fee',
        amount: -PLATFORM_FEE,
        description: 'Platform support fee',
        bet_id: data.id,
      })
    }
    await supabase.from('transactions').insert(ledger)
  }

  return { data, error }
}

export async function submitCheckin({ bet, userId, file, gps }) {
  const timestamp = Date.now()
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/${bet.id}/${timestamp}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('checkin-photos')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
  if (uploadError) return { error: uploadError }

  const { data: signed } = await supabase.storage
    .from('checkin-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  const { data: checkin, error: insertError } = await supabase
    .from('checkins')
    .insert({
      bet_id: bet.id,
      user_id: userId,
      photo_url: signed?.signedUrl || path,
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      gps_verified: Boolean(gps),
    })
    .select()
    .single()
  if (insertError) return { error: insertError }

  const newCount = (bet.checkins_completed || 0) + 1
  const { data: updatedBet } = await supabase
    .from('bets')
    .update({ checkins_completed: newCount })
    .eq('id', bet.id)
    .select()
    .single()

  let resolution = null
  if (updatedBet) resolution = await resolveBet(updatedBet)

  return { checkin, bet: updatedBet, resolution }
}

export async function resolveBet(bet) {
  if (!bet || bet.status !== 'active') return null

  const completed = bet.checkins_completed || 0
  const required = bet.checkins_required || 0

  if (completed >= required) {
    return finalizeBet(bet, 'won')
  }
  if (isPast(bet.end_date)) {
    return finalizeBet(bet, 'forfeited')
  }
  return null
}

async function finalizeBet(bet, outcome) {
  const { data: updated } = await supabase
    .from('bets')
    .update({ status: outcome })
    .eq('id', bet.id)
    .eq('status', 'active')
    .select()
    .single()

  if (!updated) return null

  if (outcome === 'won') {
    const credit = creditOnWin(bet.amount)
    await supabase.from('transactions').insert({
      user_id: bet.user_id,
      type: 'bet_won',
      amount: credit,
      description: `Won: ${bet.description}`,
      bet_id: bet.id,
    })
    await adjustBalance(bet.user_id, credit)
  } else {
    const cut = platformCut(bet.amount)
    await supabase.from('transactions').insert({
      user_id: bet.user_id,
      type: 'bet_forfeited',
      amount: -(bet.amount - cut),
      description: `Forfeited: ${bet.description}`,
      bet_id: bet.id,
    })
  }

  return { outcome, bet: updated }
}

async function adjustBalance(userId, delta) {
  const { data: profile } = await supabase
    .from('users')
    .select('boy_points_balance')
    .eq('id', userId)
    .single()
  const next = (profile?.boy_points_balance || 0) + delta
  await supabase.from('users').update({ boy_points_balance: next }).eq('id', userId)
}

export async function sendTip({ userId, amount, betId }) {
  return supabase.from('transactions').insert({
    user_id: userId,
    type: 'tip',
    amount: -amount,
    description: 'Tip to support BOY',
    bet_id: betId || null,
  })
}

export async function requestWithdrawal({ userId, amount, upiId }) {
  const { data, error } = await supabase
    .from('withdrawals')
    .insert({ user_id: userId, amount, upi_id: upiId, status: 'pending' })
    .select()
    .single()
  if (error) return { error }

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'withdrawal',
    amount: -amount,
    description: `Withdrawal to ${upiId}`,
  })
  await adjustBalance(userId, -amount)

  return { data }
}
