import { useEffect, useState, useCallback } from 'react'
import * as Icons from 'lucide-react'
import {
  Plus, Pencil, Trash2, CheckCircle2, CreditCard, Target, BookMarked,
  TrendingDown, ArrowDownLeft, Settings,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { EmptyState } from '@/components/atoms/EmptyState'
import { Spinner } from '@/components/atoms/Spinner'
import { Card } from '@/components/atoms/Card'
import { MonthPicker } from '@/components/molecules/MonthPicker'
import { BudgetProgress } from '@/components/organisms/BudgetProgress'
import { savingsService } from '@/services/savingsService'
import { debtService } from '@/services/debtService'
import { budgetService } from '@/services/budgetService'
import { transactionService } from '@/services/transactionService'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useTransactionStore } from '@/store/transactionStore'
import { formatCurrency, formatDate } from '@/utils/formatters'

const TABS = [
  { id: 'budget',  label: 'Anggaran',  icon: Target },
  { id: 'savings', label: 'Tabungan',  icon: BookMarked },
  { id: 'debt',    label: 'Hutang',    icon: TrendingDown },
]

export const GoalsPage = () => {
  const { user }                            = useAuthStore()
  const { addToast, openBudgetModal, openSavingsModal, openDebtModal, setActiveRoute } = useUIStore()
  const { selectedMonth, setSelectedMonth } = useTransactionStore()

  const [tab,       setTab]      = useState('budget')
  const [savings,   setSavings]  = useState([])
  const [debts,     setDebts]    = useState([])
  const [budgets,   setBudgets]  = useState([])
  const [spentMap,  setSpentMap] = useState({})
  const [loading,   setLoading]  = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [s, d, b, breakdown] = await Promise.all([
        savingsService.getAll(user.id),
        debtService.getAll(user.id),
        budgetService.getByMonth(user.id, selectedMonth),
        transactionService.getCategoryBreakdown(user.id, selectedMonth),
      ])
      setSavings(s)
      setDebts(d)
      setBudgets(b)
      const map = {}
      breakdown.forEach((item) => { if (item.category_id) map[item.category_id] = item.amount })
      setSpentMap(map)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedMonth])

  useEffect(() => { loadData() }, [loadData])

  const handleDeleteSaving = async (id) => {
    if (!confirm('Hapus target tabungan ini?')) return
    try { await savingsService.delete(id); setSavings((p) => p.filter((s) => s.id !== id)); addToast('Target dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleDeleteDebt = async (id) => {
    if (!confirm('Hapus catatan ini?')) return
    try { await debtService.delete(id); setDebts((p) => p.filter((d) => d.id !== id)); addToast('Catatan dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleToggleSettle = async (debt) => {
    try {
      const newStatus = debt.status === 'paid' ? 'unpaid' : 'paid'
      const updated = await debtService.update(debt.id, {
        ...debt, status: newStatus,
        paid_amount: newStatus === 'paid' ? debt.amount : debt.paid_amount,
      })
      setDebts((p) => p.map((d) => (d.id === debt.id ? updated : d)))
      addToast(newStatus === 'paid' ? 'Ditandai lunas' : 'Ditandai belum lunas')
    } catch (err) { addToast(err.message, 'error') }
  }

  const handleDeleteBudget = async (id) => {
    if (!confirm('Hapus anggaran ini?')) return
    try { await budgetService.delete(id); setBudgets((p) => p.filter((b) => b.id !== id)); addToast('Anggaran dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleAdd = () => {
    if (tab === 'savings') openSavingsModal(null)
    if (tab === 'debt')    openDebtModal(null)
    if (tab === 'budget')  openBudgetModal(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-text-primary">Tujuan &amp; Hutang</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveRoute('settings')}
              aria-label="Pengaturan"
              className="lg:hidden h-9 w-9 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center
                text-text-muted hover:text-text-primary hover:bg-bg-overlay hover:scale-105 active:scale-95
                transition-all duration-200"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={handleAdd}
              aria-label="Tambah item"
              className="h-9 w-9 rounded-2xl bg-accent-income flex items-center justify-center
                text-bg hover:brightness-110 active:scale-95 transition-all duration-200 shadow-glow-income/30 group"
            >
              <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-elevated rounded-2xl">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                text-xs font-semibold transition-all duration-250
                ${tab === id
                  ? 'bg-bg-surface text-text-primary shadow-card scale-[1.02]'
                  : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              <Icon size={13} className={tab === id ? 'text-accent-income' : ''} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'budget' && (
          <div className="mt-3 animate-fade-in-down">
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={32} /></div>
        ) : (
          <div key={tab} className="page-enter">
            {tab === 'budget' && (
              <BudgetTabContent
                budgets={budgets}
                spentMap={spentMap}
                onEdit={(b) => openBudgetModal(b)}
                onDelete={handleDeleteBudget}
                onCreate={handleAdd}
              />
            )}
            {tab === 'savings' && (
              <SavingsTabContent
                savings={savings}
                onEdit={(s) => openSavingsModal(s)}
                onDelete={handleDeleteSaving}
                onCreate={handleAdd}
              />
            )}
            {tab === 'debt' && (
              <DebtTabContent
                debts={debts}
                onEdit={(d) => openDebtModal(d)}
                onDelete={handleDeleteDebt}
                onToggleSettle={handleToggleSettle}
                onCreate={handleAdd}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Budget Tab ────────────────────────────────────────────────────────────────
const BudgetTabContent = ({ budgets, spentMap, onEdit, onDelete, onCreate }) => (
  <div className="space-y-3">
    {budgets.length === 0 ? (
      <EmptyState icon={Target} title="Belum ada anggaran"
        description="Buat anggaran bulanan untuk mengontrol pengeluaran"
        action={<Button size="sm" icon={Plus} onClick={onCreate}>Buat Anggaran</Button>} />
    ) : (
      <>
        {budgets.map((b, i) => (
          <div key={b.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <BudgetProgress
              budget={b}
              spent={spentMap[b.category_id] || 0}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
        <Button variant="secondary" className="w-full" icon={Plus} onClick={onCreate}>
          Tambah Anggaran
        </Button>
      </>
    )}
  </div>
)

// ── Savings Goal Icon Renderer ───────────────────────────────────────────────
const GoalIcon = ({ name }) => {
  const IconComponent = Icons[name] || Icons.PiggyBank
  return (
    <div className="w-10 h-10 rounded-2xl bg-accent-purple/15 flex items-center justify-center flex-shrink-0 text-accent-purple">
      <IconComponent size={20} strokeWidth={1.8} />
    </div>
  )
}

// ── Savings Tab ───────────────────────────────────────────────────────────────
const SavingsTabContent = ({ savings, onEdit, onDelete, onCreate }) => {
  const totalTarget  = savings.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = savings.reduce((s, g) => s + g.current_amount, 0)
  const overallPct   = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  return (
    <div className="space-y-3">
      {savings.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-accent-purple/10 to-accent-income/5 border-accent-purple/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted">Total Tabungan</span>
            <span className="text-xs font-bold text-accent-purple">{overallPct.toFixed(0)}% terkumpul</span>
          </div>
          <p className="text-xl font-extrabold text-text-primary mb-2 tabular-nums">
            {formatCurrency(totalCurrent)}
            <span className="text-xs text-text-muted font-normal ml-1">/ {formatCurrency(totalTarget)}</span>
          </p>
          <ProgressBar value={totalCurrent} max={totalTarget} color="#A78BFA" />
        </Card>
      )}

      {savings.length === 0 ? (
        <EmptyState icon={BookMarked} title="Belum ada target tabungan"
          description="Rencanakan target tabungan untuk impian finansialmu"
          action={<Button size="sm" icon={Plus} onClick={onCreate}>Buat Target Tabungan</Button>} />
      ) : (
        <>
          {savings.map((goal, i) => {
            const pct = goal.target_amount > 0
              ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0
            const done = goal.current_amount >= goal.target_amount

            return (
              <Card key={goal.id} className="p-4 space-y-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <GoalIcon name={goal.emoji} />
                    <div>
                      <p className="text-sm font-bold text-text-primary">{goal.name}</p>
                      <p className="text-xs text-text-muted">
                        {done ? (
                          <span className="flex items-center gap-1 text-accent-income font-medium">
                            <CheckCircle2 size={12} /> Target tercapai!
                          </span>
                        ) : goal.deadline ? `Target: ${formatDate(goal.deadline)}` : 'Tanpa deadline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(goal)}
                      aria-label="Edit target"
                      className="p-1.5 rounded-xl hover:bg-bg-overlay text-text-muted hover:text-text-primary
                        transition-all duration-150 hover:scale-110"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(goal.id)}
                      aria-label="Hapus target"
                      className="p-1.5 rounded-xl hover:bg-accent-expense/10 text-text-muted hover:text-accent-expense
                        transition-all duration-150 hover:scale-110"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-accent-income tabular-nums">{formatCurrency(goal.current_amount, { compact: true })}</span>
                    <span className="font-bold text-text-muted">{pct.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={goal.current_amount} max={goal.target_amount} color="#A78BFA" />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Sisa: {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount), { compact: true })}</span>
                    <span>Target: {formatCurrency(goal.target_amount, { compact: true })}</span>
                  </div>
                </div>
              </Card>
            )
          })}
          <Button variant="secondary" className="w-full" icon={Plus} onClick={onCreate}>
            Tambah Target Baru
          </Button>
        </>
      )}
    </div>
  )
}

// ── Debt Tab ──────────────────────────────────────────────────────────────────
const DebtTabContent = ({ debts, onEdit, onDelete, onToggleSettle, onCreate }) => {
  const unpaid          = debts.filter((d) => d.status !== 'paid')
  const paid            = debts.filter((d) => d.status === 'paid')
  const totalDebt       = debts.filter((d) => d.type === 'payable'    && d.status !== 'paid').reduce((s, d) => s + d.amount, 0)
  const totalReceivable = debts.filter((d) => d.type === 'receivable' && d.status !== 'paid').reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-3">
      {debts.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3.5 border-accent-expense/20 hover:border-accent-expense/35 transition-colors duration-300">
            <p className="text-xs text-accent-expense font-semibold mb-1 flex items-center gap-1.5">
              <TrendingDown size={12} /> Hutang
            </p>
            <p className="text-lg font-extrabold text-accent-expense tabular-nums">{formatCurrency(totalDebt, { compact: true })}</p>
          </Card>
          <Card className="p-3.5 border-accent-income/20 hover:border-accent-income/35 transition-colors duration-300">
            <p className="text-xs text-accent-income font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Piutang
            </p>
            <p className="text-lg font-extrabold text-accent-income tabular-nums">{formatCurrency(totalReceivable, { compact: true })}</p>
          </Card>
        </div>
      )}

      {debts.length === 0 ? (
        <EmptyState icon={CreditCard} title="Belum ada catatan hutang"
          description="Catat hutang & piutang untuk memantau kewajiban finansial"
          action={<Button size="sm" icon={Plus} onClick={onCreate}>Catat Hutang/Piutang</Button>} />
      ) : (
        <>
          {unpaid.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Aktif ({unpaid.length})</p>
              {unpaid.map((d, i) => (
                <div key={d.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <DebtCard debt={d} onEdit={onEdit} onDelete={onDelete} onToggle={onToggleSettle} />
                </div>
              ))}
            </>
          )}
          {paid.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">Lunas ({paid.length})</p>
              {paid.map((d) => (
                <DebtCard key={d.id} debt={d} onEdit={onEdit} onDelete={onDelete} onToggle={onToggleSettle} />
              ))}
            </>
          )}
          <Button variant="secondary" className="w-full" icon={Plus} onClick={onCreate}>Tambah Catatan</Button>
        </>
      )}
    </div>
  )
}

const DebtCard = ({ debt, onEdit, onDelete, onToggle }) => {
  const isRec  = debt.type === 'receivable'
  const isPaid = debt.status === 'paid'
  const rem    = Math.max(0, debt.amount - (debt.paid_amount || 0))

  return (
    <Card className={`p-4 transition-opacity duration-300 ${isPaid ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0
            transition-transform duration-200 hover:scale-110
            ${isRec ? 'bg-accent-income/10 text-accent-income' : 'bg-accent-expense/10 text-accent-expense'}`}>
            {isRec ? <ArrowDownLeft size={18} strokeWidth={2} /> : <CreditCard size={18} strokeWidth={1.8} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{debt.person_name}</p>
            <p className="text-xs text-text-muted">
              {isRec ? 'Piutang' : 'Hutang'}
              {debt.due_date ? ` · Jatuh tempo ${formatDate(debt.due_date)}` : ''}
              {isPaid ? ' · Lunas' : ''}
            </p>
          </div>
        </div>
        <p className={`text-base font-extrabold tabular-nums ${isRec ? 'text-accent-income' : 'text-accent-expense'}`}>
          {formatCurrency(debt.amount, { compact: true })}
        </p>
      </div>
      {debt.paid_amount > 0 && debt.paid_amount < debt.amount && (
        <div className="mb-2.5 space-y-1">
          <ProgressBar value={debt.paid_amount} max={debt.amount} color={isRec ? '#34D399' : '#FB7185'} />
          <div className="flex justify-between text-xs text-text-muted">
            <span>Terbayar: {formatCurrency(debt.paid_amount, { compact: true })}</span>
            <span>Sisa: {formatCurrency(rem, { compact: true })}</span>
          </div>
        </div>
      )}
      {debt.note && <p className="text-xs text-text-muted italic mb-2.5">"{debt.note}"</p>}
      <div className="flex gap-2 pt-2.5 border-t border-border">
        <button
          onClick={() => onToggle(debt)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
            transition-all duration-200 hover:scale-105
            ${isPaid ? 'text-text-muted hover:bg-bg-elevated' : 'text-accent-income hover:bg-accent-income/10'}`}
        >
          <CheckCircle2 size={12} />{isPaid ? 'Batal Lunas' : 'Lunas'}
        </button>
        <button
          onClick={() => onEdit(debt)}
          aria-label="Edit catatan"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl
            text-text-muted hover:bg-bg-elevated transition-all duration-200 hover:scale-105"
        >
          <Pencil size={12} />Edit
        </button>
        <button
          onClick={() => onDelete(debt.id)}
          aria-label="Hapus catatan"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl
            text-text-muted hover:text-accent-expense hover:bg-accent-expense/10
            transition-all duration-200 hover:scale-105 ml-auto"
        >
          <Trash2 size={12} />Hapus
        </button>
      </div>
    </Card>
  )
}
