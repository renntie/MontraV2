import { useEffect, useState } from 'react'
import {
  Settings, Sparkles, TrendingUp, TrendingDown, AlertCircle,
  BarChart3, HeartPulse, Calendar as CalendarIcon, Eye, EyeOff
} from 'lucide-react'
import { MonthlyBarChart } from '@/components/organisms/MonthlyBarChart'
import { SpendingDonutChart } from '@/components/organisms/SpendingDonutChart'
import { FinancialHealthCard } from '@/components/organisms/FinancialHealthCard'
import { FinancialCalendar } from '@/components/organisms/FinancialCalendar'
import { MonthPicker } from '@/components/molecules/MonthPicker'
import { SummaryCard } from '@/components/molecules/SummaryCard'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { useTransactionStore } from '@/store/transactionStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency } from '@/utils/formatters'

const ANALYTICS_TABS = [
  { id: 'overview', label: 'Grafik & Tren',       icon: BarChart3 },
  { id: 'health',   label: 'Kesehatan 50/30/20',  icon: HeartPulse },
  { id: 'calendar', label: 'Kalender Arus Kas',   icon: CalendarIcon },
]

export const AnalyticsPage = () => {
  const { user } = useAuthStore()
  const { setActiveRoute, isPrivacyMode, togglePrivacyMode } = useUIStore()
  const {
    transactions, summary, categoryBreakdown, monthlyComparison, loading,
    selectedMonth, setSelectedMonth,
    fetchTransactions, fetchSummary, fetchCategoryBreakdown, fetchMonthlyComparison,
  } = useTransactionStore()

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user?.id) return
    fetchTransactions(user.id)
    fetchSummary(user.id)
    fetchCategoryBreakdown(user.id)
    fetchMonthlyComparison(user.id)
  }, [user?.id, selectedMonth])

  const savingsRate = summary.income > 0
    ? Math.max(0, ((summary.income - summary.expense) / summary.income) * 100)
    : 0

  const rateColor =
    savingsRate >= 30 ? '#34D399' :
    savingsRate >= 10 ? '#FBBF24' : '#FB7185'

  const rateLabel =
    savingsRate >= 30 ? 'Luar biasa!' :
    savingsRate >= 10 ? 'Cukup baik'  :
    savingsRate > 0   ? 'Perlu ditingkatkan' :
    'Pengeluaran melebihi pemasukan'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-text-primary">Analitik & Wawasan</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo (Sensor)'}
              className={`h-9 px-3 rounded-2xl border flex items-center gap-1.5 text-xs font-semibold
                transition-all duration-200 hover:scale-105 ${
                  isPrivacyMode
                    ? 'bg-accent-income/15 border-accent-income/30 text-accent-income'
                    : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary'
                }`}
            >
              {isPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
              <span className="hidden sm:inline">{isPrivacyMode ? 'Sensor Aktif' : 'Sensor'}</span>
            </button>
            <button
              onClick={() => setActiveRoute('settings')}
              aria-label="Pengaturan"
              className="lg:hidden h-9 w-9 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center
                text-text-muted hover:text-text-primary hover:bg-bg-overlay hover:scale-105 active:scale-95
                transition-all duration-200"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-bg-elevated rounded-2xl">
          {ANALYTICS_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-bg-surface text-text-primary shadow-sm scale-[1.02]'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-accent-income' : ''} />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Month picker only on overview & health */}
        {activeTab !== 'calendar' && (
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 space-y-4 scrollbar-hide">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              {['income', 'expense'].map((type, i) => (
                <div key={type} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <SummaryCard type={type} amount={summary[type]} />
                </div>
              ))}
            </div>

            {/* Savings Rate Card */}
            <Card className="p-5 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-text-muted font-medium mb-1">Tingkat Tabungan</p>
                  <p
                    className="text-3xl font-extrabold tabular-nums transition-all duration-500"
                    style={{ color: rateColor }}
                  >
                    {isPrivacyMode ? '•••••%' : `${savingsRate.toFixed(1)}%`}
                  </p>
                  <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                    {savingsRate >= 30 ? (
                      <Sparkles size={13} style={{ color: rateColor }} />
                    ) : savingsRate >= 10 ? (
                      <TrendingUp size={13} style={{ color: rateColor }} />
                    ) : savingsRate > 0 ? (
                      <AlertCircle size={13} style={{ color: rateColor }} />
                    ) : (
                      <TrendingDown size={13} style={{ color: rateColor }} />
                    )}
                    {rateLabel}
                  </p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                    transition-transform duration-300 hover:scale-110"
                  style={{ background: rateColor + '18' }}
                >
                  {savingsRate >= 30 ? (
                    <Sparkles size={24} style={{ color: rateColor }} />
                  ) : savingsRate >= 10 ? (
                    <TrendingUp size={24} style={{ color: rateColor }} />
                  ) : (
                    <TrendingDown size={24} style={{ color: rateColor }} />
                  )}
                </div>
              </div>

              {/* Rate bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
                  <span>0%</span>
                  <span className="text-text-secondary">Target ideal: 30%</span>
                  <span>100%</span>
                </div>
                <div className="relative h-2.5 bg-bg-overlay rounded-full overflow-hidden">
                  <div className="absolute top-0 h-full w-px bg-border-strong" style={{ left: '30%' }} />
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-smooth"
                    style={{
                      width: `${Math.min(100, savingsRate)}%`,
                      background: `linear-gradient(90deg, ${rateColor}88, ${rateColor})`,
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Donut Chart */}
            <Card className="p-5 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              <h2 className="text-sm font-semibold text-text-primary mb-4">Proporsi Pengeluaran</h2>
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <SpendingDonutChart data={categoryBreakdown} />
              )}
            </Card>

            {/* Monthly Bar Chart */}
            <Card className="p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Perbandingan 6 Bulan</h2>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-income inline-block" /> Masuk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-expense inline-block" /> Keluar
                  </span>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <MonthlyBarChart data={monthlyComparison} />
              )}
            </Card>

            {/* Top Expenses */}
            {categoryBreakdown.length > 0 && (
              <Card className="p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h2 className="text-sm font-semibold text-text-primary mb-4">Top Pengeluaran</h2>
                <div className="space-y-3.5">
                  {categoryBreakdown.slice(0, 6).map((cat, i) => {
                    const pct = summary.expense > 0 ? (cat.amount / summary.expense) * 100 : 0
                    return (
                      <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 hover:scale-125"
                              style={{ background: cat.color || '#FB7185' }}
                            />
                            <span className="text-text-secondary font-medium">{cat.name}</span>
                          </div>
                          <span className="text-text-muted tabular-nums">
                            {isPrivacyMode ? '••••••••' : formatCurrency(cat.amount, { compact: true })} &middot; {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-smooth"
                            style={{
                              width: `${pct}%`,
                              background: cat.color || '#FB7185',
                              animationDelay: `${300 + i * 60}ms`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Tab 2: Financial Health Score (50/30/20) */}
        {activeTab === 'health' && (
          <FinancialHealthCard transactions={transactions} summary={summary} />
        )}

        {/* Tab 3: Financial Calendar */}
        {activeTab === 'calendar' && (
          <FinancialCalendar transactions={transactions} initialDate={selectedMonth} />
        )}
      </div>
    </div>
  )
}
