import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeDate } from '@/utils/formatters'
import { useWalletStore } from '@/store/walletStore'
import { useUIStore } from '@/store/uiStore'

export const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { type, amount, note, date, categories, wallet_id } = transaction
  const { wallets } = useWalletStore()
  const { isPrivacyMode } = useUIStore()
  const wallet = wallets.find((w) => w.id === wallet_id)
  const isIncome = type === 'income'
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id) => {
    setDeleting(true)
    await onDelete?.(id)
    setDeleting(false)
  }

  return (
    <div className={`
      flex items-center gap-3 px-3 py-2.5 rounded-2xl group
      transition-all duration-200 hover:bg-bg-elevated/70
      ${deleting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
    `}>
      {/* Icon with subtle scale on hover */}
      <div className="transition-transform duration-200 group-hover:scale-105">
        <CategoryIcon
          iconName={categories?.icon  || (isIncome ? 'TrendingUp' : 'MoreHorizontal')}
          color={categories?.color    || (isIncome ? '#34D399' : '#9CA3AF')}
          size={17}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
          {note || categories?.name || 'Transaksi'}
        </p>
        <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
          {categories?.name && <span>{categories.name}</span>}
          {wallet && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${wallet.color || '#34D399'}20`, color: wallet.color || '#34D399' }}
            >
              {wallet.name}
            </span>
          )}
          {(categories?.name || wallet) && date ? ' · ' : ''}
          {date ? formatRelativeDate(date) : ''}
        </p>
      </div>

      {/* Amount + hover actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className={`
          text-sm font-bold tabular-nums transition-all duration-200
          group-hover:mr-1
          ${isIncome ? 'text-accent-income' : 'text-accent-expense'}
        `}>
          {isPrivacyMode
            ? '••••••••'
            : `${isIncome ? '+' : '-'}${formatCurrency(amount, { compact: true })}`}
        </span>

        <div className="flex gap-0.5 overflow-hidden max-w-0 group-hover:max-w-[64px] transition-all duration-200">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay
                transition-all duration-150 hover:scale-110"
              title="Edit"
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleDelete(transaction.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-accent-expense hover:bg-accent-expense/10
                transition-all duration-150 hover:scale-110"
              title="Hapus"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
