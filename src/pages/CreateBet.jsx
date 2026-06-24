import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Briefcase, BookOpen, Sparkles } from 'lucide-react'
import GradientHeader from '../components/ui/GradientHeader'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { openRazorpay, isRazorpayConfigured } from '../lib/razorpay'
import { createBet, computeCheckinsRequired } from '../lib/betActions'
import { MIN_BET, PLATFORM_FEE, toRupees, toPaise } from '../lib/revenue'

const GOAL_TYPES = [
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'productivity', label: 'Productivity', icon: Briefcase },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'custom', label: 'Custom', icon: Sparkles },
]
const DURATIONS = [7, 14, 30]
const FREQUENCIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'every2', label: 'Every 2 days' },
  { id: 'weekly', label: 'Weekly' },
]
const STAKE_PRESETS = [100, 200, 500, 1000]

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[44px] px-4 rounded-btn text-[14px] font-700 border transition active:scale-[0.98] ${
        active
          ? 'bg-lime text-indigo border-lime'
          : 'bg-white text-indigo border-black/10'
      }`}
    >
      {children}
    </button>
  )
}

export default function CreateBet() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [goalType, setGoalType] = useState('fitness')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(7)
  const [customDuration, setCustomDuration] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [stake, setStake] = useState(500)
  const [customStake, setCustomStake] = useState('')
  const [platformFee, setPlatformFee] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  const durationDays = duration === 'custom' ? parseInt(customDuration || '0', 10) : duration
  const stakeRupees = stake === 'custom' ? parseInt(customStake || '0', 10) : stake
  const stakePaise = toPaise(stakeRupees)
  const totalPaise = stakePaise + (platformFee ? PLATFORM_FEE : 0)
  const checkinsRequired = useMemo(
    () => (durationDays > 0 ? computeCheckinsRequired(durationDays, frequency) : 0),
    [durationDays, frequency]
  )

  const next = () => {
    setError('')
    if (step === 1) {
      if (description.trim().length < 3) return setError('Describe your goal in a few words.')
    }
    if (step === 2) {
      if (!durationDays || durationDays < 1) return setError('Pick a duration.')
    }
    if (step === 3) {
      if (stakePaise < MIN_BET) return setError('Minimum bet is ₹100.')
    }
    setStep((s) => Math.min(4, s + 1))
  }

  const back = () => {
    setError('')
    if (step === 1) navigate(-1)
    else setStep((s) => s - 1)
  }

  const persistBet = async (paymentRes) => {
    const { data, error: err } = await createBet({
      userId: user.id,
      goalType,
      description: description.trim(),
      amount: stakePaise,
      durationDays,
      frequency,
      platformFeePaid: platformFee,
      razorpayOrderId: paymentRes?.razorpay_order_id || null,
      razorpayPaymentId: paymentRes?.razorpay_payment_id || null,
    })
    setPaying(false)
    if (err) {
      setError(err.message || 'Could not save your bet. Please try again.')
      return
    }
    await refreshProfile()
    navigate(`/bet/${data.id}`, { replace: true })
  }

  const lockItIn = () => {
    setError('')
    if (stakePaise < MIN_BET) return setError('Minimum bet is ₹100.')
    setPaying(true)

    // If Razorpay isn't configured (e.g. local preview without keys), still let
    // the user create the bet so the flow is reviewable end-to-end.
    if (!isRazorpayConfigured) {
      persistBet(null)
      return
    }

    openRazorpay({
      amount: totalPaise,
      name: profile?.name,
      phone: user?.phone,
      email: user?.email,
      onSuccess: (res) => persistBet(res),
      onFailure: (reason) => {
        setPaying(false)
        if (reason !== 'dismissed') setError('Payment failed. Please try again.')
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <GradientHeader title="New Bet" back={false}>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-lime' : 'bg-white/25'}`}
            />
          ))}
        </div>
      </GradientHeader>

      <div className="flex-1 overflow-y-auto px-4 py-5 no-scrollbar">
        {/* Step 1 — Goal */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[20px] text-indigo">What's your goal?</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoalType(g.id)}
                  className={`min-h-[64px] rounded-card p-3 flex items-center gap-2 border transition active:scale-[0.98] ${
                    goalType === g.id
                      ? 'bg-lime text-indigo border-lime'
                      : 'bg-white text-indigo border-black/10'
                  }`}
                >
                  <g.icon size={20} />
                  <span className="font-700 text-[14px]">{g.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label className="block mb-1.5 text-[13px] font-500 text-indigo/80">
                Describe your goal
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="e.g. Hit the gym every day for 7 days"
                className="w-full min-h-[96px] rounded-inp bg-white border border-black/10 px-4 py-3 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 resize-none"
              />
              <div className="mt-1 text-right text-[12px] text-muted">{description.length}/200</div>
            </div>
          </div>
        )}

        {/* Step 2 — Duration & Frequency */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[20px] text-indigo">How long?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                  {d} days
                </Chip>
              ))}
              <Chip active={duration === 'custom'} onClick={() => setDuration('custom')}>
                Custom
              </Chip>
            </div>
            {duration === 'custom' && (
              <input
                inputMode="numeric"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="Number of days"
                className="mt-3 w-full min-h-[52px] rounded-inp bg-white border border-black/10 px-4 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
              />
            )}

            <h2 className="mt-7 font-display text-[20px] text-indigo">Check in how often?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <Chip key={f.id} active={frequency === f.id} onClick={() => setFrequency(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>

            {durationDays > 0 && (
              <p className="mt-5 text-[13px] text-muted">
                That's <span className="font-700 text-indigo">{checkinsRequired} check-ins</span> to win.
              </p>
            )}
          </div>
        )}

        {/* Step 3 — Stake */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-[20px] text-indigo">How much are you betting?</h2>

            <div className="mt-5 flex items-end justify-center gap-1">
              <span className="text-violet text-[28px] font-700 mb-1">₹</span>
              <span className="font-mono text-[44px] text-indigo leading-none">
                {(stakeRupees || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {STAKE_PRESETS.map((s) => (
                <Chip key={s} active={stake === s} onClick={() => setStake(s)}>
                  ₹{s}
                </Chip>
              ))}
              <Chip active={stake === 'custom'} onClick={() => setStake('custom')}>
                Custom
              </Chip>
            </div>
            {stake === 'custom' && (
              <input
                inputMode="numeric"
                value={customStake}
                onChange={(e) => setCustomStake(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter amount (min ₹100)"
                className="mt-3 w-full min-h-[52px] rounded-inp bg-white border border-black/10 px-4 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
              />
            )}
            {stakePaise > 0 && stakePaise < MIN_BET && (
              <p className="mt-2 text-[13px] text-coral text-center">Minimum bet is ₹100.</p>
            )}

            {/* Platform fee toggle */}
            <div className="mt-7 bg-white rounded-card shadow-card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-700 text-[14px] text-indigo">Support the platform</p>
                <p className="text-[12px] text-muted">Add ₹5 to keep the lights on. Worth it?</p>
              </div>
              <button
                onClick={() => setPlatformFee((v) => !v)}
                className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 ${
                  platformFee ? 'bg-lime' : 'bg-black/15'
                }`}
                aria-pressed={platformFee}
              >
                <span
                  className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    platformFee ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Review & Pay */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-[20px] text-indigo">Review &amp; lock in</h2>
            <div className="mt-4 bg-white rounded-card shadow-card p-4 space-y-3">
              <Row label="Goal" value={description} />
              <Row label="Type" value={GOAL_TYPES.find((g) => g.id === goalType)?.label} />
              <Row label="Duration" value={`${durationDays} days`} />
              <Row
                label="Check-ins"
                value={`${checkinsRequired} × ${
                  FREQUENCIES.find((f) => f.id === frequency)?.label
                }`}
              />
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <Row label="Bet stake" value={toRupees(stakePaise)} mono />
                {platformFee && <Row label="Platform fee" value={toRupees(PLATFORM_FEE)} mono />}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-700 text-[15px] text-indigo">Total charged now</span>
                  <span className="font-mono text-[18px] text-violet">{toRupees(totalPaise)}</span>
                </div>
              </div>
            </div>

            {!isRazorpayConfigured && (
              <p className="mt-3 text-[12px] text-amber">
                Razorpay key not set — bet will be created without a live charge (demo mode).
              </p>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-[13px] text-coral">{error}</p>}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-black/[0.06] px-4 py-3 pb-safe">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={back}>
            Back
          </Button>
          {step < 4 ? (
            <Button className="flex-[2]" onClick={next}>
              Next →
            </Button>
          ) : (
            <Button className="flex-[2]" onClick={lockItIn} loading={paying}>
              Lock it in →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[13px] text-muted shrink-0">{label}</span>
      <span className={`text-[14px] text-indigo text-right ${mono ? 'font-mono' : 'font-500'}`}>
        {value}
      </span>
    </div>
  )
}
