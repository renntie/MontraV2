import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { useState } from 'react'

const CONFIGS = {
  income:  { label: 'Pemasukan',   icon: TrendingUp,   iconBg: 'bg-accent-income/10',  iconColor: 'text-accent-income',  valColor: 'text-accent-income' },
  expense: { label: 'Pengeluaran', icon: TrendingDown,  iconBg: 'bg-accent-expense/10', iconColor: 'text-accent-expense', valColor: 'text-accent-expense' },
  balance: { label: 'Saldo Bersih',icon: Wallet,        iconBg: 'bg-accent-blue/10',    iconColor: 'text-accent-blue',    valColor: 'text-text-primary' },
}

export const SummaryCard = ({ type, amount }) => {
  const cfg   = CONFIGS[type] ?? CONFIGS.balance
  const Icon  = cfg.icon
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="bg-bg-surface border border-border rounded-3xl p-4 flex flex-col gap-3
        transition-all duration-300 cursor-default
        hover:border-border-strong hover:-translate-y-0.5 hover:shadow-elevated"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`w-9 h-9 rounded-2xl ${cfg.iconBg} flex items-center justify-center
        transition-transform duration-300 ${hovered ? 'scale-110' : ''}`}>
        <Icon size={17} className={cfg.iconColor} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-0.5 font-medium">{cfg.label}</p>
        <p className={`text-lg font-extrabold tabular-nums ${cfg.valColor}`}>
          {formatCurrency(amount, { compact: true })}
        </p>
      </div>
    </div>
  )
}
