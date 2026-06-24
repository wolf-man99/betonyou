export default function Input({ label, hint, error, className = '', as = 'input', ...props }) {
  const Component = as
  return (
    <label className="block">
      {label && (
        <span className="block mb-1.5 text-[13px] font-500 text-indigo/80">{label}</span>
      )}
      <Component
        className={`w-full min-h-[52px] rounded-inp bg-white border px-4 py-3
          text-[16px] text-indigo placeholder:text-muted/70 outline-none
          focus:border-violet focus:ring-2 focus:ring-violet/20 transition
          ${error ? 'border-coral' : 'border-black/10'} ${
            as === 'textarea' ? 'min-h-[96px] resize-none' : ''
          } ${className}`}
        {...props}
      />
      {error ? (
        <span className="block mt-1 text-[12px] text-coral">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  )
}
