import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronRight, Target } from 'lucide-react'
import { budgetService } from '@/services/budgetService'
import { transactionService } from '@/services/transactionService'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency } from '@/utils/formatters'

export const DashboardBudgetAlert = ({ selectedMonth }) => {
  const { user } = useAuthStore()
  const { setActiveRoute } = useUIStore()

  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    if (!user?.id) return

    const checkBudgets = async () => {
      try {
        const [budgets, breakdown] = await Promise.all([
          budgetService.getByMonth(user.id, selectedMonth),
          transactionService.getCategoryBreakdown(user.id, selectedMonth),
        ])

        const spentMap = {}
        breakdown.forEach((item) => {
          if (item.category_id) spentMap[item.category_id] = item.amount
        })

        const alertList = []
        budgets.forEach((b) => {
          const spent = spentMap[b.category_id] || 0
          const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
          if (pct >= 80) {
            alertList.push({
              id: b.id,
              name: b.categories?.name || 'Kategori',
              color: b.categories?.color || '#FB7185',
              spent,
              limit: b.amount,
              pct: Math.round(pct),
              isOver: spent > b.amount,
            })
          }
        })

        setWarnings(alertList)
      } catch (err) {
        // silent catch
      }
    }

    checkBudgets()
  }, [user?.id, selectedMonth])

  if (warnings.length === 0) return null

  const hasOver = warnings.some(w => w.isOver)

  return (
    <div
      onClick={() => setActiveRoute('goals')}
      className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer animate-fade-in-up ${
        hasOver
          ? 'bg-accent-expense/10 border-accent-expense/30 hover:border-accent-expense/50'
          : 'bg-accent-yellow/10 border-accent-yellow/30 hover:border-accent-yellow/50'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              hasOver ? 'bg-accent-expense/20 text-accent-expense' : 'bg-accent-yellow/20 text-accent-yellow'
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${hasOver ? 'text-accent-expense' : 'text-accent-yellow'}`}>
                {hasOver ? '⚠️ Peringatan Anggaran' : '⚡ Anggaran Mendekati Limit'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-bg-surface text-text-secondary border border-border">
                {warnings.length} Kategori
              </span>
            </div>
            <p className="text-xs text-text-primary font-medium truncate mt-0.5">
              {warnings.map(w => `${w.name} (${w.pct}%)`).join(' · ')}
            </p>
          </div>
        </div>

        <button className="text-xs font-bold text-text-primary hover:underline flex items-center gap-0.5 flex-shrink-0">
          Atur <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
