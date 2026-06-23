const TONES = {
  lime: 'bg-lime/90 text-indigo',
  violet: 'bg-violet/10 text-violet',
  indigo: 'bg-indigo text-white',
  amber: 'bg-amber/15 text-amber',
  coral: 'bg-coral/10 text-coral',
  muted: 'bg-black/5 text-muted',
  white: 'bg-white/20 text-white',
}

export default function Badge({ children, tone = 'muted', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-700 leading-none ${TONES[tone] || TONES.muted} ${className}`}
    >
      {children}
    </span>
  )
}
