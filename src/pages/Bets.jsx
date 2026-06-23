import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GradientHeader from '../components/ui/GradientHeader'
import BetCard from '../components/BetCard'
import CheckInModal from '../components/CheckInModal'
import ResolutionScreen from '../components/ResolutionScreen'
import { BetCardSkeleton } from '../components/ui/Skeleton'
import { useBets } from '../hooks/useBets'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'won', label: 'Won' },
  { id: 'forfeited', label: 'Forfeited' },
]

const EMPTY_COPY = {
  active: { emoji: '😳', text: 'No active bets. Are you scared?' },
  won: { emoji: '🏆', text: "No wins yet. They're coming." },
  forfeited: { emoji: '🤫', text: 'Nothing forfeited. Keep it that way.' },
}

export default function Bets() {
  const navigate = useNavigate()
  const { bets, loading, refetch } = useBets()
  const [tab, setTab] = useState('active')
  const [checkInBet, setCheckInBet] = useState(null)
  const [resolution, setResolution] = useState(null)

  const filtered = bets.filter((b) =>
    tab === 'active' ? b.status === 'active' || b.status === 'pending_payment' : b.status === tab
  )

  const onDone = (res) => {
    setCheckInBet(null)
    refetch()
    if (res?.resolution) setResolution(res.resolution)
  }

  return (
    <div>
      <GradientHeader title="My Bets">
        <div className="mt-4 flex gap-1 bg-white/10 rounded-full p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-h-[40px] rounded-full text-[13px] font-700 transition ${tab === t.id ? 'bg-white text-indigo' : 'text-white/85'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </GradientHeader>

      <div className="px-4 py-5">
        {loading ? (
          <div className="space-y-3">
            <BetCardSkeleton />
            <BetCardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-8 text-center mt-6">
            <p className="text-[32px]">{EMPTY_COPY[tab].emoji}</p>
            <p className="mt-2 font-700 text-[15px] text-indigo">{EMPTY_COPY[tab].text}</p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/create')}
                className="mt-4 inline-flex items-center justify-center min-h-[44px] px-6 rounded-btn bg-lime text-indigo font-700 text-[14px]"
              >
                Place a bet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                onClick={(b) => navigate(`/bet/${b.id}`)}
                onCheckIn={(b) => setCheckInBet(b)}
              />
            ))}
          </div>
        )}
      </div>

      {checkInBet && (
        <CheckInModal bet={checkInBet} onClose={() => setCheckInBet(null)} onDone={onDone} />
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
