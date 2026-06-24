import Badge from './ui/Badge'
import ProgressBar from './ui/ProgressBar'
import { toRupees } from '../lib/revenue'
import { daysRemaining } from '../lib/dates'
import { copy } from '../lib/copy'

const STATUS_TONE = {
  active: { tone: 'lime', label: 'Active' },
  won: { tone: 'lime', label: 'Won' },
  forfeited: { tone: 'coral', label: 'Forfeited' },
  pending_payment: { tone: 'amber', label: 'Pending' },
}

// Is a check-in still possible today? (active + not all check-ins done)
function checkinDue(bet) {
  return bet.status === 'active' && (bet.checkins_completed || 0) < (bet.checkins_required || 0)
}

export default function BetCard({ bet, onCheckIn, onClick }) {
  const required = bet.checkins_required || 0
  const completed = bet.checkins_completed || 0
  const pct = required ? (completed / required) * 100 : 0
  const remaining = daysRemaining(bet.end_date)
  const status = STATUS_TONE[bet.status] || STATUS_TONE.active
  const due = checkinDue(bet)
  const atRisk = due && remaining <= 1

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <button
        onClick={() => onClick?.(bet)}
        className="w-full text-left p-4 active:bg-black/[0.02] transition"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-700 text-[15px] text-indigo leading-snug line-clamp-2">
            {bet.description}
          </h3>
          <Badge tone={atRisk ? 'amber' : status.tone}>{atRisk ? 'At risk' : status.label}</Badge>
        </div>

        <div className="mt-3 font-mono text-[22px] text-violet">{toRupees(bet.amount)}</div>

        <div className="mt-3">
          <ProgressBar value={pct} />
          <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted">
            <span>
              {completed} of {required} check-ins
            </span>
            <span>{remaining === 0 ? 'Last day' : `${remaining} days left`}</span>
          </div>
        </div>
      </button>

      {due && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onCheckIn?.(bet)}
            className="w-full min-h-[44px] rounded-btn bg-lime text-indigo font-700 text-[14px] active:bg-[#9bd92f] transition"
          >
            {copy.checkinCta}
          </button>
        </div>
      )}
    </div>
  )
}
