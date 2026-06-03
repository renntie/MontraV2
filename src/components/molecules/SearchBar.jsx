import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useTransactionStore } from '@/store/transactionStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useEffect, useState } from 'react'

export const SearchBar = ({ onFilterClick }) => {
  const { filters, setFilters } = useTransactionStore()
  const [localValue, setLocalValue] = useState(filters.search || '')
  const debounced = useDebounce(localValue, 400)

  // Push debounced value to store
  useEffect(() => {
    setFilters({ search: debounced })
  }, [debounced])

  // Sync local when store resets
  useEffect(() => {
    if (!filters.search) setLocalValue('')
  }, [filters.search])

  const hasActiveFilters = filters.type || filters.categoryId

  return (
    <div className="flex gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Cari transaksi..."
          className="w-full bg-bg-elevated border border-border rounded-2xl
            pl-9 pr-9 py-2.5 text-sm text-text-primary placeholder:text-text-muted
            outline-none focus:border-accent-income/50 focus:ring-1 focus:ring-accent-income/20
            transition-colors"
        />
        {localValue && (
          <button
            onClick={() => setLocalValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter button */}
      <button
        onClick={onFilterClick}
        className={`h-10 w-10 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all ${
          hasActiveFilters
            ? 'bg-accent-income/10 border-accent-income/30 text-accent-income'
            : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-border-strong'
        }`}
      >
        <SlidersHorizontal size={16} />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-income" />
        )}
      </button>
    </div>
  )
}
