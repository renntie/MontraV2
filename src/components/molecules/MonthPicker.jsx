import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, parseISO, isSameMonth } from 'date-fns'
import { id } from 'date-fns/locale'

export const MonthPicker = ({ value, onChange }) => {
  const date       = parseISO(value)
  const isThisMonth = isSameMonth(date, new Date())

  const go = (dir) => {
    const next = dir === 'prev' ? subMonths(date, 1) : addMonths(date, 1)
    onChange(format(next, 'yyyy-MM-01'))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go('prev')}
        className="h-8 w-8 rounded-xl bg-bg-elevated flex items-center justify-center
          text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm font-bold text-text-primary min-w-[128px] text-center select-none capitalize">
        {format(date, 'MMMM yyyy', { locale: id })}
      </span>

      <button
        onClick={() => go('next')}
        disabled={isThisMonth}
        className="h-8 w-8 rounded-xl bg-bg-elevated flex items-center justify-center
          text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors
          disabled:opacity-25 disabled:pointer-events-none"
      >
        <ChevronRight size={16} />
      </button>

      {/* Jump to current month */}
      {!isThisMonth && (
        <button
          onClick={() => onChange(format(new Date(), 'yyyy-MM-01'))}
          className="ml-1 text-xs font-semibold text-accent-income hover:underline transition-all"
        >
          Sekarang
        </button>
      )}
    </div>
  )
}
