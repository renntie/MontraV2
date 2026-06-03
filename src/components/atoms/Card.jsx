export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  ...props
}) => (
  <div
    onClick={onClick}
    className={`
      bg-bg-surface border border-border rounded-3xl
      transition-all duration-300
      ${hover || onClick ? 'card-hover cursor-pointer' : ''}
      ${glow ? 'shadow-inner-glow' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
)
