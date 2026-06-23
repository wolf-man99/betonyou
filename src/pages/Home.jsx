import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, Sparkles, Target, Camera, Wallet as WalletIcon, Trophy } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useBets } from '../hooks/useBets'
import BetCard from '../components/BetCard'
import CheckInModal from '../components/CheckInModal'
import ResolutionScreen from '../components/ResolutionScreen'
import { BetCardSkeleton } from '../components/ui/Skeleton'
import { toRupees } from '../lib/revenue'
import { copy } from '../lib/copy'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

const QUICK_ACTIONS = [
  { icon: Plus, label: 'New Bet', to: '/create', tone: 'bg-violet/10 text-violet' },
  { icon: Camera, label: 'Check In', action: 'checkin', tone: 'bg-lime/30 text-[#5a9b00]' },
  { icon: WalletIcon, label: 'Wallet', to: '/wallet', tone: 'bg-amber/15 text-amber' },
  { icon: Trophy, label: 'Leaderboard', to: '/profile', tone: 'bg-coral/10 text-coral' },
]

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { bets, loading, refetch } = useBets()
  const [checkInBet, setCheckInBet] = useState(null)
  const [resolution, setResolution] = useState(null)

  const activeBets = bets.filter((b) => b.status === 'active')
  const firstActive = activeBets[0]

  const onCheckInDone = (res) => {
    setCheckInBet(null)
    refetch()
    if (res?.resolution) setResolution(res.resolution)
  }

  const handleQuickAction = (a) => {
    if (a.to) navigate(a.to)
    else if (a.action === 'checkin') {
      if (firstActive) setCheckInBet(firstActive)
      else navigate('/create')
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-30 gradient-hero text-white pt-safe">
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-700 text-[16px]">
                  {(profile?.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 bg-lime text-indigo font-mono text-[13px] px-3 py-1.5 rounded-full">
                <Sparkles size={14} />
                {toRupees(profile?.boy_points_balance || 0)}
              </span>
              <button aria-label="Notifications" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Bell size={18} />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[14px] text-white/80">{greeting()}</p>
            <h1 className="font-display text-[24px] leading-tight">
              {profile?.name || 'Champion'} 👊
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 space-y-6">
        <section>
          <h2 className="font-700 text-[16px] text-indigo mb-3">Active Bets</h2>
          {loading ? (
            <div className="space-y-3">
              <BetCardSkeleton />
              <BetCardSkeleton />
            </div>
          ) : activeBets.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-6 text-center">
              <p className="text-[28px]">😳</p>
              <p className="mt-2 font-700 text-[16px] text-indigo">{copy.emptyState}</p>
              <p className="mt-1 text-[13px] text-muted">Money on the line changes everything.</p>
              <button
                onClick={() => navigate('/create')}
                className="mt-4 inline-flex items-center justify-center gap-1 min-h-[44px] px-6 rounded-btn bg-lime text-indigo font-700 text-[14px] active:bg-[#9bd92f]"
              >
                Place your first bet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  onClick={(b) => navigate(`/bet/${b.id}`)}
                  onCheckIn={(b) => setCheckInBet(b)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-700 text-[16px] text-indigo mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => handleQuickAction(a)}
                className="bg-white rounded-card shadow-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center ${a.tone}`}>
                  <a.icon size={20} />
                </span>
                <span className="font-700 text-[14px] text-indigo">{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={() => navigate('/create')}
        aria-label="New bet"
        className="fixed z-40 bottom-[80px] right-1/2 translate-x-[216px] max-[480px]:right-4 max-[480px]:translate-x-0
          w-[52px] h-[52px] rounded-full bg-lime text-indigo shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {checkInBet && (
        <CheckInModal
          bet={checkInBet}
          onClose={() => setCheckInBet(null)}
          onDone={onCheckInDone}
        />
      )}

      {resolution && (
        <ResolutionScreen
          bet={resolution.bet}
          outcome={resolution.outcome}
          onClose={() => setResolution(null)}
          onViewWallet={() => {
            setResolution(null)
            navigate('/wallet')
          }}
          onTryAgain={() => {
            setResolution(null)
            navigate('/create')
          }}
        />
      )}
    </div>
  )
}
