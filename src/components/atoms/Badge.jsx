export const Badge = ({ children, color, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${className}`}
    style={{ background: color ? color + '22' : undefined, color: color || undefined }}
  >
    {children}
  </span>
)
