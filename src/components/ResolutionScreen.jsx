import { useMemo, useState } from 'react'
import { Trophy, Frown, X } from 'lucide-react'
import Button from './ui/Button'
import { copy } from '../lib/copy'
import { toRupees, platformCut, toPaise } from '../lib/revenue'
import { sendTip } from '../lib/betActions'
import { useAuth } from '../hooks/useAuth'

const TIP_PRESETS = [1000, 2000, 5000]

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 1.6,
        color: ['#A8E63D', '#7C3AED', '#A78BFA', '#F59E0B', '#FF4D4D'][i % 5],
      })),
    []
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function ResolutionScreen({ bet, outcome, onClose, onViewWallet, onTryAgain }) {
  const { user } = useAuth()
  const won = outcome === 'won'
  const [custom, setCustom] = useState('')
  const [tipped, setTipped] = useState(false)
  const [tipping, setTipping] = useState(false)

  const handleTip = async (amount) => {
    if (!amount || amount <= 0 || !user) return
    setTipping(true)
    await sendTip({ userId: user.id, amount, betId: bet?.id })
    setTipping(false)
    setTipped(true)
  }

  const forfeitCut = bet ? platformCut(bet.amount) : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className={`relative flex-1 flex flex-col ${won ? 'gradient-hero' : 'bg-surface'}`}>
        {won && <Confetti />}

        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full
            ${won ? 'text-white active:bg-white/15' : 'text-indigo active:bg-black/5'}`}
        >
          <X size={24} />
        </button>

        <div className="relative flex-1 overflow-y-auto no-scrollbar px-6 pt-safe">
          <div className="min-h-full flex flex-col items-center justify-center text-center py-12">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${won ? 'bg-lime' : 'bg-coral/15'}`}
            >
              {won ? (
                <Trophy size={44} className="text-indigo" />
              ) : (
                <Frown size={44} className="text-coral" />
              )}
            </div>

            <h1
              className={`mt-6 font-display text-[26px] leading-tight ${won ? 'text-white' : 'text-indigo'}`}
            >
              {won ? copy.winHeadline : copy.lossHeadline}
            </h1>
            <p className={`mt-2 text-[15px] ${won ? 'text-white/85' : 'text-muted'}`}>
              {won ? copy.winSub : copy.lossSub}
            </p>

            {won ? (
              <p className="mt-5 font-mono text-[34px] text-lime">{toRupees(bet?.amount || 0)}</p>
            ) : (
              <div className="mt-5 w-full max-w-[320px] rounded-card bg-white p-4 text-left shadow-card">
                <p className="text-[12px] font-700 text-muted">WHAT YOU FORFEITED</p>
                <Row label="Your stake" value={toRupees(bet?.amount || 0)} />
                <Row label="Platform keeps (15%)" value={toRupees(forfeitCut)} muted />
              </div>
            )}

            <div className="mt-8 w-full max-w-[320px]">
              {tipped ? (
                <p className={`text-[14px] ${won ? 'text-white/85' : 'text-muted'}`}>
                  Thank you 💚 You're the reason BOY exists.
                </p>
              ) : (
                <>
                  <p className={`text-[14px] ${won ? 'text-white/85' : 'text-muted'}`}>
                    {copy.tipPrompt}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {TIP_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleTip(amt)}
                        disabled={tipping}
                        className="min-h-[44px] rounded-btn bg-white/90 text-indigo font-700 text-[14px] active:bg-white disabled:opacity-50"
                      >
                        {toRupees(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      inputMode="numeric"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Custom ₹"
                      className="flex-1 min-h-[44px] rounded-btn bg-white/90 px-4 text-[15px] text-indigo outline-none"
                    />
                    <button
                      onClick={() => handleTip(toPaise(custom))}
                      disabled={tipping || !custom}
                      className="px-5 min-h-[44px] rounded-btn bg-lime text-indigo font-700 text-[14px] disabled:opacity-50"
                    >
                      Tip
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative px-6 pb-safe">
          <div className="pb-5">
            {won ? (
              <Button variant="lime" onClick={onViewWallet}>
                View wallet
              </Button>
            ) : (
              <Button variant="indigo" onClick={onTryAgain}>
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="mt-2 flex items-center justify-between text-[14px]">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${muted ? 'text-muted' : 'text-indigo'}`}>{value}</span>
    </div>
  )
}
