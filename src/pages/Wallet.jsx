import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Trophy,
  X,
  Wallet as WalletIcon,
} from 'lucide-react'
import GradientHeader from '../components/ui/GradientHeader'
import WalletCard from '../components/WalletCard'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { useWallet } from '../hooks/useWallet'
import { useAuth } from '../hooks/useAuth'
import { requestWithdrawal } from '../lib/betActions'
import { toRupees, toPaise, paiseToRupeeNumber, MIN_WITHDRAWAL } from '../lib/revenue'
import { formatDate } from '../lib/dates'
import { copy } from '../lib/copy'

const TX_META = {
  bet_won: { icon: Trophy, tone: 'text-[#5a9b00]' },
  bet_placed: { icon: ArrowUpRight, tone: 'text-coral' },
  bet_forfeited: { icon: ArrowUpRight, tone: 'text-coral' },
  platform_fee: { icon: Gift, tone: 'text-muted' },
  tip: { icon: Gift, tone: 'text-violet' },
  withdrawal: { icon: ArrowDownLeft, tone: 'text-coral' },
}

export default function Wallet() {
  const { user } = useAuth()
  const { balance, transactions, loading, refetch } = useWallet()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div>
      <GradientHeader title="Wallet" />

      <div className="px-4 py-5 space-y-6">
        <WalletCard balance={balance} onWithdraw={() => setSheetOpen(true)} />

        <section>
          <h2 className="font-700 text-[16px] text-indigo mb-3">Recent activity</h2>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-8 text-center">
              <WalletIcon size={28} className="mx-auto text-black/20" />
              <p className="mt-2 font-700 text-[15px] text-indigo">{copy.walletEmpty}</p>
            </div>
          ) : (
            <div className="bg-white rounded-card shadow-card divide-y divide-black/[0.05]">
              {transactions.map((t) => {
                const meta = TX_META[t.type] || { icon: WalletIcon, tone: 'text-muted' }
                const credit = t.amount >= 0
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3.5">
                    <span className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0">
                      <meta.icon size={17} className={meta.tone} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-500 text-indigo truncate">{t.description}</p>
                      <p className="text-[12px] text-muted">{formatDate(t.created_at)}</p>
                    </div>
                    <span
                      className={`font-mono text-[14px] shrink-0 ${
                        credit ? 'text-[#5a9b00]' : 'text-coral'
                      }`}
                    >
                      {credit ? '+' : '-'}
                      {toRupees(Math.abs(t.amount))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {sheetOpen && (
        <WithdrawSheet
          balance={balance}
          userId={user?.id}
          onClose={() => setSheetOpen(false)}
          onSuccess={() => {
            setSheetOpen(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

function WithdrawSheet({ balance, userId, onClose, onSuccess }) {
  const [upi, setUpi] = useState('')
  const [amount, setAmount] = useState(String(paiseToRupeeNumber(balance)))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    setError('')
    const paise = toPaise(amount)
    if (!/^[\w.-]+@[\w.-]+$/.test(upi)) return setError('Enter a valid UPI ID (name@bank).')
    if (paise < MIN_WITHDRAWAL) return setError('Minimum withdrawal is ₹100.')
    if (paise > balance) return setError("You can't withdraw more than your balance.")
    setLoading(true)
    const { error: err } = await requestWithdrawal({ userId, amount: paise, upiId: upi.trim() })
    setLoading(false)
    if (err) return setError(err.message || 'Could not submit request.')
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-app bg-white rounded-t-[24px] p-5 pb-safe animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-700 text-[18px] text-indigo">
            {done ? 'Request submitted' : 'Withdraw via UPI'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-1 flex items-center justify-center rounded-full active:bg-black/5">
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div className="mt-4 text-center py-6">
            <p className="text-[40px]">✅</p>
            <p className="mt-3 text-[15px] text-indigo font-500">
              Request submitted. We'll process within 24 hours.
            </p>
            <div className="mt-6">
              <Button onClick={onSuccess}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-[13px] text-muted">
              Available: <span className="font-700 text-indigo">{toRupees(balance)}</span>
            </p>

            <label className="block mt-4">
              <span className="block mb-1.5 text-[13px] font-500 text-indigo/80">UPI ID</span>
              <input
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                placeholder="yourname@bank"
                className="w-full min-h-[52px] rounded-inp border border-black/10 px-4 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
              />
            </label>

            <label className="block mt-4">
              <span className="block mb-1.5 text-[13px] font-500 text-indigo/80">Amount (₹)</span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full min-h-[52px] rounded-inp border border-black/10 px-4 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
              />
            </label>

            {error && <p className="mt-3 text-[13px] text-coral">{error}</p>}

            <div className="mt-5">
              <Button onClick={submit} loading={loading}>
                Request withdrawal
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
