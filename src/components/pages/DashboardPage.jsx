import { useEffect, useState } from 'react'
import {
  Download, LogOut, RefreshCw, Heart, ExternalLink, Settings,
  ArrowRight, ArrowLeftRight, Wallet, Users, Plus, ChevronRight,
  Building2, Smartphone, TrendingUp, MoreHorizontal, Eye, EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { SummaryCard } from '@/components/molecules/SummaryCard'
import { MonthPicker } from '@/components/molecules/MonthPicker'
import { TransactionItem } from '@/components/molecules/TransactionItem'
import { SpendingDonutChart } from '@/components/organisms/SpendingDonutChart'
import { DashboardBudgetAlert } from '@/components/organisms/DashboardBudgetAlert'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/atoms/EmptyState'
import { MontraLogo } from '@/components/atoms/MontraLogo'
import { useTransactionStore } from '@/store/transactionStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWalletStore } from '@/store/walletStore'
import { exportTransactionsToCSV } from '@/utils/csvExport'
import { formatCurrency } from '@/utils/formatters'

const SOCIABUZZ_URL = 'https://sociabuzz.com/lilramm'

export const DashboardPage = () => {
  const { user, signOut }  = useAuthStore()
  const {
    transactions, summary, categoryBreakdown, loading,
    selectedMonth, setSelectedMonth, refreshAll,
  } = useTransactionStore()
  const {
    openTransactionModal, setActiveRoute, addToast,
    openWalletModal, openTransferModal, openSplitBillModal, openSubscriptionModal,
    isPrivacyMode, togglePrivacyMode,
  } = useUIStore()
  const { wallets, balances, getTotalBalance, fetchWallets } = useWalletStore()
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (user?.id) refreshAll(user.id)
  }, [user?.id, selectedMonth])

  const handleExport = () => {
    if (!transactions.length) { addToast('Tidak ada data untuk diekspor', 'info'); return }
    exportTransactionsToCSV(transactions, `montra-${format(new Date(selectedMonth), 'yyyy-MM')}`)
    addToast('Data berhasil diekspor ke CSV')
  }

  const handleRefresh = async () => {
    setSpinning(true)
    await refreshAll(user.id)
    setTimeout(() => setSpinning(false), 600)
  }

  const balancePositive = summary.balance >= 0

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 pt-4 pb-3">
        {/* Logo kiri */}
        <MontraLogo size="sm" />
        {/* Actions kanan */}
        <div className="flex items-center gap-1.5">
          {[
            { icon: isPrivacyMode ? EyeOff : Eye, onClick: togglePrivacyMode, spin: false, label: 'privacy', active: isPrivacyMode },
            { icon: RefreshCw, onClick: handleRefresh, spin: spinning, label: 'refresh' },
            { icon: Download,  onClick: handleExport,  spin: false,    label: 'export' },
            { icon: Settings,  onClick: () => setActiveRoute('settings'), spin: false, label: 'settings' },
            { icon: LogOut,    onClick: signOut,       spin: false,    label: 'logout', danger: true },
          ].map(({ icon: Icon, onClick, spin, label, danger, active }) => (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              className={`h-8 w-8 rounded-xl bg-bg-surface border border-border flex items-center justify-center
                transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0
                ${active
                  ? 'text-accent-income bg-accent-income/10 border-accent-income/30'
                  : danger
                  ? 'text-text-muted hover:text-accent-expense hover:bg-accent-expense/5'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}
            >
              <Icon size={15} className={spin ? 'animate-spin' : ''} />
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5 capitalize">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo (Sensor)'}
            className={`h-9 px-3.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold
              transition-all duration-200 hover:scale-105 ${
                isPrivacyMode
                  ? 'bg-accent-income/15 border-accent-income/30 text-accent-income'
                  : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary'
              }`}
          >
            {isPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{isPrivacyMode ? 'Sensor Aktif' : 'Sensor Saldo'}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="h-9 px-3 rounded-2xl bg-bg-elevated border border-border
              flex items-center gap-1.5 text-text-muted text-sm
              hover:text-text-primary transition-all duration-200 hover:scale-105"
          >
            <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-9 px-4 rounded-2xl bg-bg-elevated border border-border
              text-text-secondary text-sm hover:text-text-primary
              transition-all duration-200 hover:scale-105 hover:border-border-strong"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-6 pb-28 lg:pb-6 space-y-4 scrollbar-hide">

        {/* Month Picker */}
        <div className="flex items-center pt-1 animate-fade-in-down">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {/* Budget Alert Widget */}
        <DashboardBudgetAlert selectedMonth={selectedMonth} />

        {/* Balance Hero */}
        <Card className="p-5 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-accent-income/4
            -translate-y-14 translate-x-14 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-accent-blue/4
            translate-y-10 -translate-x-10 pointer-events-none" />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-xs font-medium text-text-muted">Saldo Bersih Bulan Ini</p>
            <button
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-overlay"
            >
              {isPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className={`text-3xl lg:text-4xl font-extrabold tracking-tight tabular-nums relative z-10
            transition-all duration-500
            ${balancePositive ? 'text-text-primary' : 'text-accent-expense text-glow-expense'}`}>
            {isPrivacyMode ? 'Rp ••••••••' : `${!balancePositive ? '- ' : ''}${formatCurrency(Math.abs(summary.balance))}`}
          </p>
          <p className="text-xs text-text-muted mt-2 relative z-10">
            {format(new Date(selectedMonth), 'MMMM yyyy', { locale: id })}
          </p>

          {summary.income > 0 && (
            <div className="mt-4 relative z-10">
              <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-income to-accent-income/70 rounded-full
                    transition-all duration-700 ease-smooth"
                  style={{ width: `${Math.min(100, (summary.income / (summary.income + summary.expense)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                <span className="text-accent-income font-medium">
                  Pemasukan {summary.income > 0 ? Math.round((summary.income / (summary.income + summary.expense)) * 100) : 0}%
                </span>
                <span className="text-accent-expense font-medium">
                  Pengeluaran {summary.expense > 0 ? Math.round((summary.expense / (summary.income + summary.expense)) * 100) : 0}%
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-4 gap-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          {[
            {
              label: 'Dompet',
              icon: Wallet,
              color: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 hover:border-accent-blue/50',
              onClick: () => setActiveRoute('wallets'),
            },
            {
              label: 'Transfer',
              icon: ArrowLeftRight,
              color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20 hover:border-accent-purple/50',
              onClick: openTransferModal,
            },
            {
              label: 'Split Bill',
              icon: Users,
              color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 hover:border-amber-400/50',
              onClick: openSplitBillModal,
            },
            {
              label: 'Langganan',
              icon: RefreshCw,
              color: 'text-rose-400 bg-rose-400/10 border-rose-400/20 hover:border-rose-400/50',
              onClick: () => setActiveRoute('goals'),
            },
          ].map(({ label, icon: Icon, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-bg-surface border border-border
                hover:bg-bg-elevated transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] group text-center"
            >
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${color}`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-semibold text-text-secondary truncate w-full">{label}</span>
            </button>
          ))}
        </div>

        {/* Multi-Wallet Preview Carousel */}
        {wallets.length > 0 ? (
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Wallet size={14} className="text-accent-income" />
                Saldo Rekening & Dompet
              </p>
              <button
                onClick={() => setActiveRoute('wallets')}
                className="text-xs text-accent-income font-medium hover:underline flex items-center gap-0.5"
              >
                Kelola <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {wallets.map((w) => {
                const bal = balances[w.id] ?? w.initial_balance
                return (
                  <div
                    key={w.id}
                    onClick={() => setActiveRoute('wallets')}
                    className="flex-shrink-0 w-44 p-3 rounded-2xl bg-bg-surface border border-border
                      hover:border-border-strong hover:bg-bg-elevated cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: w.color || '#34D399' }}
                      />
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        {w.type}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary truncate">{w.name}</p>
                    <p className="text-sm font-extrabold text-text-primary mt-1 tabular-nums">
                      {isPrivacyMode ? '••••••••' : formatCurrency(bal)}
                    </p>
                  </div>
                )
              })}
              <button
                onClick={openWalletModal}
                className="flex-shrink-0 w-28 p-3 rounded-2xl border border-dashed border-border
                  hover:border-accent-income/50 hover:bg-accent-income/5 flex flex-col items-center justify-center gap-1.5
                  text-text-muted hover:text-accent-income transition-all"
              >
                <Plus size={18} />
                <span className="text-[11px] font-semibold">Tambah</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-bg-surface border border-border/70 flex items-center justify-between gap-3 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
                <Wallet size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Kelola Multi-Wallet</p>
                <p className="text-[11px] text-text-muted">Pisahkan saldo rekening Bank, E-Wallet & Tunai</p>
              </div>
            </div>
            <button
              onClick={openWalletModal}
              className="px-3 py-1.5 rounded-xl bg-accent-income text-bg text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
            >
              + Buat
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {['income', 'expense'].map((type, i) => (
            <div key={type} className="animate-fade-in-up" style={{ animationDelay: `${100 + i * 60}ms` }}>
              <SummaryCard type={type} amount={summary[type]} />
            </div>
          ))}
        </div>

        {/* Chart */}
        <Card className="p-5 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pengeluaran per Kategori</h2>
          {loading
            ? <div className="flex justify-center py-8"><Spinner /></div>
            : <SpendingDonutChart data={categoryBreakdown} />}
        </Card>

        {/* Recent Transactions */}
        <Card className="p-4 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Transaksi Terkini</h2>
            <button
              onClick={() => setActiveRoute('transactions')}
              className="text-xs text-accent-income font-semibold hover:underline flex items-center gap-1
                transition-all duration-150 hover:text-accent-income/80"
            >
              Lihat semua <ArrowRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="Belum ada transaksi"
              description='Tap "+" untuk menambah transaksi pertama' />
          ) : (
            <div className="space-y-0.5">
              {transactions.slice(0, 7).map((tx, i) => (
                <div key={tx.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <TransactionItem transaction={tx} onEdit={(t) => openTransactionModal(t)} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Support Sociabuzz */}
        <a
          href={SOCIABUZZ_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block animate-fade-in-up lg:hidden"
          style={{ animationDelay: '320ms' }}
        >
          <div className="relative overflow-hidden rounded-3xl p-4 border border-accent-sociabuzz/20
            bg-gradient-to-r from-accent-sociabuzz/8 to-accent-purple/8
            hover:border-accent-sociabuzz/35 hover:from-accent-sociabuzz/12 hover:to-accent-purple/12
            transition-all duration-300 active:scale-[0.98] group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl sociabuzz-gradient flex items-center justify-center
                flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Heart size={18} className="text-white" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold gradient-text-sociabuzz">Support Developer</p>
                <p className="text-xs text-text-muted">Traktir kopi di Sociabuzz</p>
              </div>
              <ExternalLink size={14} className="text-accent-sociabuzz/50 flex-shrink-0" />
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
