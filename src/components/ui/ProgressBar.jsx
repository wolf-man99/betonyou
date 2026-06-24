export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={`w-full h-[5px] rounded-full bg-black/10 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-lime transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
