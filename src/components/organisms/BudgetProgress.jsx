import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { formatCurrency } from '@/utils/formatters'

export const BudgetProgress = ({ budget, spent = 0, onEdit, onDelete }) => {
  const pct       = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
  const isOver    = spent > budget.amount
  const isWarning = !isOver && pct >= 80
  const remaining = budget.amount - spent

  const statusColor = isOver ? '#FB7185' : isWarning ? '#FBBF24' : (budget.categories?.color || '#34D399')

  return (
    <div className={`bg-bg-surface border rounded-3xl p-4 transition-all ${
      isOver ? 'border-accent-expense/30' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <CategoryIcon
            iconName={budget.categories?.icon  || 'MoreHorizontal'}
            color={budget.categories?.color    || '#9CA3AF'}
            size={16}
          />
          <span className="text-sm font-semibold text-text-primary">
            {budget.categories?.name || 'Kategori'}
          </span>
          {isOver && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-accent-expense bg-accent-expense/10 px-2 py-0.5 rounded-lg">
              <AlertTriangle size={10} /> Melebihi
            </span>
          )}
          {isWarning && (
            <span className="text-[10px] font-bold text-accent-yellow bg-accent-yellow/10 px-2 py-0.5 rounded-lg">
              ⚠ 80%+
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold tabular-nums ${
            isOver ? 'text-accent-expense' : isWarning ? 'text-accent-yellow' : 'text-text-muted'
          }`}>
            {pct.toFixed(0)}%
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="p-1 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1 rounded-xl text-text-muted hover:text-accent-expense hover:bg-accent-expense/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar value={spent} max={budget.amount} color={statusColor} className="mb-2" />

      {/* Footer */}
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">
          Terpakai:{' '}
          <span className={`font-semibold ${isOver ? 'text-accent-expense' : 'text-text-secondary'}`}>
            {formatCurrency(spent, { compact: true })}
          </span>
        </span>
        <span className="text-text-muted">
          Limit:{' '}
          <span className="font-semibold text-text-secondary">
            {formatCurrency(budget.amount, { compact: true })}
          </span>
        </span>
      </div>

      {isOver && (
        <p className="text-xs text-accent-expense font-semibold mt-2 flex items-center gap-1">
          <AlertTriangle size={11} />
          Melebihi anggaran sebesar {formatCurrency(Math.abs(remaining), { compact: true })}
        </p>
      )}
    </div>
  )
}
