import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Image as ImageIcon } from 'lucide-react'
import GradientHeader from '../components/ui/GradientHeader'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import CheckInModal from '../components/CheckInModal'
import ResolutionScreen from '../components/ResolutionScreen'
import { useBet } from '../hooks/useBets'
import { toRupees } from '../lib/revenue'
import { daysRemaining, formatDate, formatTime } from '../lib/dates'
import { copy } from '../lib/copy'

const STATUS = {
  active: { tone: 'lime', label: 'Active' },
  won: { tone: 'lime', label: 'Won' },
  forfeited: { tone: 'coral', label: 'Forfeited' },
  pending_payment: { tone: 'amber', label: 'Pending' },
}

export default function BetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bet, checkins, loading, refetch } = useBet(id)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [resolution, setResolution] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <GradientHeader title="Loading…" back />
        <div className="p-4 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (!bet) {
    return (
      <div className="min-h-screen bg-surface">
        <GradientHeader title="Not found" back />
        <div className="p-6 text-center text-muted">This bet could not be found.</div>
      </div>
    )
  }

  const required = bet.checkins_required || 0
  const completed = bet.checkins_completed || 0
  const pct = required ? (completed / required) * 100 : 0
  const remaining = daysRemaining(bet.end_date)
  const status = STATUS[bet.status] || STATUS.active
  const due = bet.status === 'active' && completed < required
  const atRisk = due && remaining <= 1

  const onDone = (res) => {
    setCheckInOpen(false)
    refetch()
    if (res?.resolution) setResolution(res.resolution)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <GradientHeader
        title={bet.description}
        back
        right={<Badge tone={atRisk ? 'amber' : status.tone}>{atRisk ? 'At risk' : status.label}</Badge>}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 no-scrollbar">
        {/* Stake + progress */}
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-[12px] text-muted">Stake on the line</p>
          <p className="mt-1 font-mono text-[34px] text-violet leading-none">{toRupees(bet.amount)}</p>

          <div className="mt-5">
            <ProgressBar value={pct} />
            <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
              <span className="font-500 text-indigo">
                {completed} of {required} check-ins
              </span>
              <span>{remaining === 0 ? 'Last day' : `${remaining} days left`}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <Meta label="Started" value={formatDate(bet.start_date)} />
            <Meta label="Ends" value={formatDate(bet.end_date)} />
          </div>
        </div>

        {/* Timeline */}
        <section>
          <h2 className="font-700 text-[16px] text-indigo mb-3">Check-in timeline</h2>
          {checkins.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-6 text-center text-muted">
              <ImageIcon size={28} className="mx-auto text-black/20" />
              <p className="mt-2 text-[13px]">No check-ins yet. Prove you showed up.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkins.map((c) => (
                <div key={c.id} className="bg-white rounded-card shadow-card p-3 flex gap-3">
                  <img
                    src={c.photo_url}
                    alt="Check-in"
                    className="w-16 h-16 rounded-xl object-cover bg-surface shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-700 text-indigo">
                      {formatDate(c.checked_at)}
                    </p>
                    <p className="text-[12px] text-muted">{formatTime(c.checked_at)}</p>
                    <p className="mt-1 flex items-center gap-1 text-[12px]">
                      {c.gps_verified ? (
                        <span className="flex items-center gap-1 text-[#5a9b00]">
                          <MapPin size={13} /> Location verified
                        </span>
                      ) : (
                        <span className="text-muted">No location data</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sticky check-in button */}
      {due && (
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-black/[0.06] px-4 py-3 pb-safe">
          <Button onClick={() => setCheckInOpen(true)}>{copy.checkinCta}</Button>
        </div>
      )}

      {checkInOpen && (
        <CheckInModal bet={bet} onClose={() => setCheckInOpen(false)} onDone={onDone} />
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

function Meta({ label, value }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-2">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-[13px] font-700 text-indigo">{value}</p>
    </div>
  )
}
