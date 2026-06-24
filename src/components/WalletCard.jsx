import { toRupees, MIN_WITHDRAWAL } from '../lib/revenue'

export default function WalletCard({ balance = 0, onWithdraw }) {
  const canWithdraw = balance >= MIN_WITHDRAWAL
  return (
    <div className="gradient-hero rounded-card p-5 text-white shadow-card">
      <p className="text-[12px] font-700 tracking-wide text-white/80">BOY POINTS</p>
      <p className="mt-1 font-mono text-[28px] text-lime leading-none">{toRupees(balance)}</p>
      <p className="mt-2 text-[12px] text-white/75">Min ₹100 to withdraw</p>

      <button
        onClick={onWithdraw}
        disabled={!canWithdraw}
        className="mt-4 w-full min-h-[44px] rounded-btn bg-white/95 text-indigo font-700 text-[15px]
          active:bg-white disabled:opacity-50 disabled:pointer-events-none transition"
      >
        Withdraw via UPI
      </button>
    </div>
  )
}
