import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, CreditCard, Target, BookMarked, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/atoms/Button'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { EmptyState } from '@/components/atoms/EmptyState'
import { Spinner } from '@/components/atoms/Spinner'
import { Card } from '@/components/atoms/Card'
import { BottomSheet } from '@/components/molecules/BottomSheet'
import { MonthPicker } from '@/components/molecules/MonthPicker'
import { SavingsForm } from '@/components/organisms/SavingsForm'
import { DebtForm } from '@/components/organisms/DebtForm'
import { BudgetForm } from '@/components/organisms/BudgetForm'
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
  const { addToast }                        = useUIStore()
  const { selectedMonth, setSelectedMonth } = useTransactionStore()

  const [tab,       setTab]      = useState('budget')
  const [savings,   setSavings]  = useState([])
  const [debts,     setDebts]    = useState([])
  const [budgets,   setBudgets]  = useState([])
  const [spentMap,  setSpentMap] = useState({})
  const [loading,   setLoading]  = useState(true)

  const [savingsSheet,  setSavingsSheet]  = useState(false)
  const [debtSheet,     setDebtSheet]     = useState(false)
  const [budgetSheet,   setBudgetSheet]   = useState(false)
  const [editingSaving, setEditingSaving] = useState(null)
  const [editingDebt,   setEditingDebt]   = useState(null)
  const [editingBudget, setEditingBudget] = useState(null)

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
      addToast(newStatus === 'paid' ? '✓ Ditandai lunas' : 'Ditandai belum lunas')
    } catch (err) { addToast(err.message, 'error') }
  }

  const handleDeleteBudget = async (id) => {
    if (!confirm('Hapus anggaran ini?')) return
    try { await budgetService.delete(id); setBudgets((p) => p.filter((b) => b.id !== id)); addToast('Anggaran dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleAdd = () => {
    if (tab === 'savings') { setEditingSaving(null); setSavingsSheet(true) }
    if (tab === 'debt')    { setEditingDebt(null);   setDebtSheet(true) }
    if (tab === 'budget')  { setEditingBudget(null); setBudgetSheet(true) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-text-primary">Tujuan &amp; Hutang</h1>
          <button
            onClick={handleAdd}
            className="h-9 w-9 rounded-2xl bg-accent-income flex items-center justify-center
              text-bg hover:brightness-110 active:scale-95 transition-all duration-200 shadow-glow-income/30 group"
          >
            <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
          </button>
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
                onEdit={(b) => { setEditingBudget(b); setBudgetSheet(true) }}
                onDelete={handleDeleteBudget}
                onCreate={handleAdd}
              />
            )}
            {tab === 'savings' && (
              <SavingsTabContent
                savings={savings}
                onEdit={(s) => { setEditingSaving(s); setSavingsSheet(true) }}
                onDelete={handleDeleteSaving}
                onCreate={handleAdd}
              />
            )}
            {tab === 'debt' && (
              <DebtTabContent
                debts={debts}
                onEdit={(d) => { setEditingDebt(d); setDebtSheet(true) }}
                onDelete={handleDeleteDebt}
                onToggleSettle={handleToggleSettle}
                onCreate={handleAdd}
              />
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      <BottomSheet isOpen={savingsSheet} onClose={() => { setSavingsSheet(false); setEditingSaving(null) }}
        title={editingSaving ? 'Edit Target Tabungan' : 'Target Tabungan Baru'}>
        <SavingsForm saving={editingSaving}
          onClose={() => { setSavingsSheet(false); setEditingSaving(null) }} onSaved={loadData} />
      </BottomSheet>

      <BottomSheet isOpen={debtSheet} onClose={() => { setDebtSheet(false); setEditingDebt(null) }}
        title={editingDebt ? 'Edit Catatan' : 'Catat Hutang / Piutang'}>
        <DebtForm debt={editingDebt}
          onClose={() => { setDebtSheet(false); setEditingDebt(null) }} onSaved={loadData} />
      </BottomSheet>

      <BottomSheet isOpen={budgetSheet} onClose={() => { setBudgetSheet(false); setEditingBudget(null) }}
        title={editingBudget ? 'Edit Anggaran' : 'Buat Anggaran Baru'}>
        <BudgetForm budget={editingBudget} selectedMonth={selectedMonth}
          onClose={() => { setBudgetSheet(false); setEditingBudget(null) }} onSaved={loadData} />
      </BottomSheet>
    </div>
  )
}

// ── Budget Tab ─────────────────────────────────────────────────────────────────
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

// ── Savings Tab ────────────────────────────────────────────────────────────────
const SavingsTabContent = ({ savings, onEdit, onDelete, onCreate }) => {
  const total   = savings.reduce((s, g) => s + (g.target_amount  || 0), 0)
  const current = savings.reduce((s, g) => s + (g.current_amount || 0), 0)

  return (
    <div className="space-y-3">
      {savings.length > 0 && (
        <Card className="p-4 animate-fade-in">
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-xs text-text-muted">Total Terkumpul</p>
              <p className="text-xl font-extrabold text-accent-income tabular-nums">
                {formatCurrency(current, { compact: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Total Target</p>
              <p className="text-sm font-semibold text-text-secondary tabular-nums">
                {formatCurrency(total, { compact: true })}
              </p>
            </div>
          </div>
          <ProgressBar value={current} max={total} />
          <p className="text-xs text-text-muted mt-1.5">
            {total > 0 ? ((current / total) * 100).toFixed(1) : 0}% dari semua target
          </p>
        </Card>
      )}

      {savings.length === 0 ? (
        <EmptyState icon={BookMarked} title="Belum ada target tabungan"
          description="Buat target untuk mencapai impianmu"
          action={<Button size="sm" icon={Plus} onClick={onCreate}>Tambah Target</Button>} />
      ) : (
        <>
          {savings.map((goal, i) => {
            const pct  = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0
            const done = pct >= 100
            return (
              <Card key={goal.id} hover
                className={`p-4 animate-fade-in-up ${done ? 'border-accent-income/30' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent-purple/10 flex items-center justify-center
                      text-xl flex-shrink-0 transition-transform duration-300 hover:scale-110">
                      {goal.emoji || '💰'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{goal.name}</p>
                      <p className="text-xs text-text-muted">
                        {done ? '🎉 Target tercapai!' : goal.deadline
                          ? `Deadline: ${formatDate(goal.deadline)}`
                          : 'Tanpa deadline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(goal)}
                      className="p-1.5 rounded-xl hover:bg-bg-overlay text-text-muted hover:text-text-primary
                        transition-all duration-150 hover:scale-110">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(goal.id)}
                      className="p-1.5 rounded-xl hover:bg-accent-expense/10 text-text-muted hover:text-accent-expense
                        transition-all duration-150 hover:scale-110">
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

// ── Debt Tab ───────────────────────────────────────────────────────────────────
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
              <TrendingDown size={11} /> Hutang
            </p>
            <p className="text-lg font-extrabold text-accent-expense tabular-nums">{formatCurrency(totalDebt, { compact: true })}</p>
          </Card>
          <Card className="p-3.5 border-accent-income/20 hover:border-accent-income/35 transition-colors duration-300">
            <p className="text-xs text-accent-income font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={11} /> Piutang
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
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0
            transition-transform duration-200 hover:scale-110
            ${isRec ? 'bg-accent-income/10' : 'bg-accent-expense/10'}`}>
            {isRec ? '📥' : '💳'}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{debt.person_name}</p>
            <p className="text-xs text-text-muted">
              {isRec ? 'Piutang' : 'Hutang'}
              {debt.due_date ? ` · Jatuh tempo ${formatDate(debt.due_date)}` : ''}
              {isPaid ? ' · ✓ Lunas' : ''}
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
        <button onClick={() => onToggle(debt)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
            transition-all duration-200 hover:scale-105
            ${isPaid ? 'text-text-muted hover:bg-bg-elevated' : 'text-accent-income hover:bg-accent-income/10'}`}>
          <CheckCircle2 size={12} />{isPaid ? 'Batal Lunas' : 'Lunas'}
        </button>
        <button onClick={() => onEdit(debt)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl
            text-text-muted hover:bg-bg-elevated transition-all duration-200 hover:scale-105">
          <Pencil size={12} />Edit
        </button>
        <button onClick={() => onDelete(debt.id)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl
            text-text-muted hover:text-accent-expense hover:bg-accent-expense/10
            transition-all duration-200 hover:scale-105 ml-auto">
          <Trash2 size={12} />Hapus
        </button>
      </div>
    </Card>
  )
}
