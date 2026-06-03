import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-accent-income text-bg font-semibold hover:brightness-110 active:scale-[0.97] shadow-glow-income/20',
  secondary: 'bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay hover:border-border-strong active:scale-[0.97]',
  danger:    'bg-accent-expense text-white font-semibold hover:brightness-110 active:scale-[0.97]',
  ghost:     'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:scale-[0.97]',
  outline:   'border border-border text-text-primary hover:bg-bg-elevated hover:border-border-strong active:scale-[0.97]',
  sociabuzz: 'sociabuzz-gradient text-white font-bold hover:brightness-110 active:scale-[0.97] shadow-glow-sociabuzz/30',
}

const sizes = {
  xs: 'h-7 px-3 text-xs rounded-xl gap-1',
  sm: 'h-8 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-2xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
  icon: 'h-10 w-10 rounded-2xl',
  'icon-sm': 'h-8 w-8 rounded-xl',
}

export const Button = forwardRef(({
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-medium
      transition-all duration-200 ease-smooth select-none
      disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
      ${variants[variant]} ${sizes[size]} ${className}
    `}
    {...props}
  >
    {loading
      ? <Loader2 size={15} className="animate-spin flex-shrink-0" />
      : Icon && <Icon size={15} className="flex-shrink-0" />
    }
    {children}
    {IconRight && !loading && <IconRight size={14} className="flex-shrink-0 ml-auto" />}
  </button>
))
Button.displayName = 'Button'
