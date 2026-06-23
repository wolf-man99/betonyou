import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useWallet() {
  const { user, profile, refreshProfile } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const balance = profile?.boy_points_balance ?? 0

  const refetch = useCallback(async () => {
    await Promise.all([fetchTransactions(), refreshProfile()])
  }, [fetchTransactions, refreshProfile])

  return { balance, transactions, loading, refetch }
}
