export default function Card({ children, className = '', onClick, ...props }) {
  const interactive = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`bg-white rounded-card shadow-card p-4 ${interactive ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
