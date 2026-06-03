import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export const Select = forwardRef(({
  label, error, options = [], placeholder = 'Pilih...', className = '', containerClassName = '', ...props
}, ref) => (
  <div className={containerClassName}>
    {label && <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
    <div className="relative">
      <select
        ref={ref}
        className={`w-full appearance-none bg-bg-elevated border rounded-2xl px-4 py-3 pr-9 text-sm text-text-primary
          placeholder:text-text-muted transition-colors outline-none cursor-pointer
          focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/30
          ${error ? 'border-accent-expense' : 'border-border'} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-bg-surface">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-xs text-accent-expense">{error}</p>}
  </div>
))
Select.displayName = 'Select'
