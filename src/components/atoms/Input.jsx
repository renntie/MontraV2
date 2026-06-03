import { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  rightIcon,
  className          = '',
  containerClassName = '',
  ...props
}, ref) => (
  <div className={containerClassName}>
    {label && (
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      )}
      <input
        ref={ref}
        className={`
          w-full bg-bg-elevated border rounded-2xl px-4 py-3 text-sm
          text-text-primary placeholder:text-text-muted transition-colors outline-none
          focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-accent-expense' : 'border-border'}
          ${Icon ? 'pl-10' : ''}
          ${rightIcon ? 'pr-10' : ''}
          ${className}
        `}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightIcon}
        </div>
      )}
    </div>
    {error  && <p className="mt-1 text-xs text-accent-expense">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
  </div>
))

Input.displayName = 'Input'
