import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO
} from 'date-fns'
import { id } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  ArrowUpRight, ArrowDownRight, Clock, Plus
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useUIStore } from '@/store/uiStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export const FinancialCalendar = ({ transactions = [], initialDate = new Date() }) => {
  const { openTransactionModal, isPrivacyMode } = useUIStore()
  const { subscriptions = [] } = useSubscriptionStore()

  const [currentMonth, setCurrentMonth] = useState(
    typeof initialDate === 'string' ? parseISO(initialDate) : initialDate
  )
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  // Group transactions & subscriptions by date string 'yyyy-MM-dd'
  const dayDataMap = useMemo(() => {
    const map = {}

    // Transactions
    transactions.forEach((tx) => {
      const dateKey = tx.date
      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, items: [], subscriptions: [] }
      }
      if (tx.type === 'income') {
        map[dateKey].income += tx.amount
      } else {
        map[dateKey].expense += tx.amount
      }
      map[dateKey].items.push(tx)
    })

    // Subscriptions due dates
    subscriptions.forEach((sub) => {
      const dateKey = sub.next_due
      if (dateKey) {
        if (!map[dateKey]) {
          map[dateKey] = { income: 0, expense: 0, items: [], subscriptions: [] }
        }
        map[dateKey].subscriptions.push(sub)
      }
    })

    return map
  }, [transactions, subscriptions])

  const selectedKey = format(selectedDate, 'yyyy-MM-dd')
  const selectedDayData = dayDataMap[selectedKey] || { income: 0, expense: 0, items: [], subscriptions: [] }

  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))
  const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header Card */}
      <Card className="p-4 border-border">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
              <CalendarIcon size={16} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-text-primary capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: id })}
              </h2>
              <p className="text-[11px] text-text-muted">Arus kas dan jadwal tagihan harian</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className="px-2.5 py-1 rounded-xl bg-bg-elevated border border-border text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all"
            >
              Hari Ini
            </button>
            <button
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="h-8 w-8 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all hover:scale-105"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              aria-label="Bulan berikutnya"
              className="h-8 w-8 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all hover:scale-105"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-[11px] font-bold text-text-muted py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const data = dayDataMap[dateKey]
            const isCurMonth = isSameMonth(day, currentMonth)
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const hasIncome = (data?.income || 0) > 0
            const hasExpense = (data?.expense || 0) > 0
            const hasSubs = (data?.subscriptions?.length || 0) > 0

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(day)}
                type="button"
                className={`
                  relative min-h-[52px] sm:min-h-[58px] p-1 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-150
                  ${!isCurMonth ? 'opacity-30' : 'opacity-100'}
                  ${isSelected
                    ? 'border-2 border-accent-income bg-accent-income/10 shadow-sm scale-105 z-10'
                    : isToday
                    ? 'border border-accent-blue/40 bg-accent-blue/5'
                    : 'border border-border/40 hover:border-border-strong hover:bg-bg-elevated'}
                `}
              >
                {/* Date Number */}
                <span
                  className={`text-xs font-bold leading-tight ${
                    isToday
                      ? 'text-accent-blue'
                      : isSelected
                      ? 'text-accent-income'
                      : 'text-text-primary'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Indicators Dots */}
                <div className="flex items-center gap-1 my-0.5">
                  {hasIncome && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-income" title="Pemasukan" />
                  )}
                  {hasExpense && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-expense" title="Pengeluaran" />
                  )}
                  {hasSubs && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" title="Jatuh Tempo Langganan" />
                  )}
                </div>

                {/* Net Cash Flow text */}
                <span className="text-[9px] font-medium truncate w-full tabular-nums text-text-muted">
                  {data ? (
                    isPrivacyMode ? (
                      '•••'
                    ) : (data.income - data.expense) !== 0 ? (
                      formatCurrency(data.income - data.expense, { compact: true })
                    ) : (
                      ''
                    )
                  ) : (
                    ''
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border text-[10px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-income" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-expense" />
            <span>Pengeluaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
            <span>Langganan</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Detail Card */}
      <Card className="p-4 border-border animate-fade-in-up">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
          <div>
            <h3 className="text-xs font-extrabold text-text-primary">
              Aktivitas: {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Masuk: <span className="text-accent-income font-semibold">{isPrivacyMode ? '••••••••' : formatCurrency(selectedDayData.income)}</span>
              {' · '}
              Keluar: <span className="text-accent-expense font-semibold">{isPrivacyMode ? '••••••••' : formatCurrency(selectedDayData.expense)}</span>
            </p>
          </div>
          <button
            onClick={() => openTransactionModal(null)}
            className="p-1.5 rounded-xl bg-accent-income/10 text-accent-income hover:bg-accent-income/20 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>

        {/* List transactions on this day */}
        {selectedDayData.items.length === 0 && selectedDayData.subscriptions.length === 0 ? (
          <div className="text-center py-6 text-text-muted text-xs">
            Tidak ada transaksi atau tagihan pada tanggal ini.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Subscriptions due today */}
            {selectedDayData.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-accent-blue/5 border border-accent-blue/20"
              >
                <div className="w-8 h-8 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center flex-shrink-0">
                  <Clock size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{sub.name}</p>
                  <p className="text-[10px] text-accent-blue">Jatuh Tempo Langganan</p>
                </div>
                <span className="text-xs font-bold text-accent-expense tabular-nums">
                  {isPrivacyMode ? '••••••••' : formatCurrency(sub.amount)}
                </span>
              </div>
            ))}

            {/* Transactions on this day */}
            {selectedDayData.items.map((tx) => {
              const isIncome = tx.type === 'income'
              return (
                <div
                  key={tx.id}
                  onClick={() => openTransactionModal(tx)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-bg-elevated cursor-pointer transition-all border border-transparent hover:border-border"
                >
                  <CategoryIcon
                    iconName={tx.categories?.icon || (isIncome ? 'TrendingUp' : 'MoreHorizontal')}
                    color={tx.categories?.color || (isIncome ? '#34D399' : '#9CA3AF')}
                    size={15}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {tx.note || tx.categories?.name || 'Transaksi'}
                    </p>
                    <p className="text-[10px] text-text-muted">{tx.categories?.name}</p>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isIncome ? 'text-accent-income' : 'text-accent-expense'
                    }`}
                  >
                    {isPrivacyMode
                      ? '••••••••'
                      : `${isIncome ? '+' : '-'}${formatCurrency(tx.amount, { compact: true })}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
