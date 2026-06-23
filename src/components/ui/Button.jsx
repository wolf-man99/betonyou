const VARIANTS = {
  lime: 'bg-lime text-indigo active:bg-[#9bd92f]',
  indigo: 'bg-indigo text-white active:opacity-90',
  violet: 'bg-violet text-white active:opacity-90',
  outline: 'bg-white text-indigo border border-black/10 active:bg-surface',
  ghost: 'bg-transparent text-indigo active:bg-black/5',
  white: 'bg-white/95 text-indigo active:bg-white',
  coral: 'bg-coral text-white active:opacity-90',
}

export default function Button({children,variant = 'lime',className = '',disabled = false,loading = false,type = 'button',...props}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`w-full min-h-[52px] rounded-btn px-6 font-body font-700 text-[16px]
        flex items-center justify-center gap-2 transition-all
        disabled:opacity-50 disabled:pointer-events-none
        ${VARIANTS[variant] || VARIANTS.lime} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
