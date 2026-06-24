import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Fetches the current user's bets (most recent first) and exposes a refetch.
export function useBets() {
  const { user } = useAuth()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBets = useCallback(async () => {
    if (!user) {
      setBets([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (err) setError(err)
    setBets(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchBets()
  }, [fetchBets])

  return { bets, loading, error, refetch: fetchBets }
}

// Fetch a single bet + its check-ins.
export function useBet(betId) {
  const [bet, setBet] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBet = useCallback(async () => {
    if (!betId) return
    setLoading(true)
    const [{ data: betData }, { data: checkinData }] = await Promise.all([
      supabase.from('bets').select('*').eq('id', betId).maybeSingle(),
      supabase
        .from('checkins')
        .select('*')
        .eq('bet_id', betId)
        .order('checked_at', { ascending: false }),
    ])
    setBet(betData || null)
    setCheckins(checkinData || [])
    setLoading(false)
  }, [betId])

  useEffect(() => {
    fetchBet()
  }, [fetchBet])

  return { bet, checkins, loading, refetch: fetchBet }
}
