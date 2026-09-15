import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import { useCategoryStore } from '@/store/categoryStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { budgetService } from '@/services/budgetService'
import { formatCurrency } from '@/utils/formatters'

export const BudgetForm = ({ budget = null, onClose, onSaved, selectedMonth }) => {
  const { user }      = useAuthStore()
  const { categories } = useCategoryStore()
  const { addToast }  = useUIStore()

  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || c.type === 'both'
  )

  const [categoryId, setCategoryId] = useState(budget?.category_id || '')
  const [amount,     setAmount]     = useState(budget?.amount?.toString() || '')
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.category_id || '')
      setAmount(budget.amount?.toString() || '')
    }
  }, [budget])

  const validate = () => {
    const e = {}
    if (!categoryId)                                  e.category = 'Pilih kategori'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = 'Masukkan jumlah anggaran'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const month = selectedMonth
        ? format(new Date(selectedMonth), 'yyyy-MM')
        : format(new Date(), 'yyyy-MM')

      await budgetService.upsert({
        ...(budget?.id ? { id: budget.id } : {}),
        user_id:     user.id,
        category_id: categoryId,
        amount:      Number(amount),
        month,
      })
      addToast(budget?.id ? 'Anggaran diperbarui' : 'Anggaran berhasil dibuat')
      onSaved?.()
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 space-y-4 pb-6">
      <Select
        label="Kategori Pengeluaran"
        value={categoryId}
        onChange={(e) => { setCategoryId(e.target.value); setErrors((p) => ({ ...p, category: '' })) }}
        options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Pilih kategori..."
        error={errors.category}
      />

      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Batas Anggaran
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">
            Rp
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: '' })) }}
            placeholder="500000"
            className={`w-full bg-bg-elevated border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors
              ${errors.amount ? 'border-accent-expense' : 'border-border'}`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-accent-expense">{errors.amount}</p>}
        {amount && Number(amount) > 0 && !errors.amount && (
          <p className="mt-1 text-xs text-text-muted">
            = {formatCurrency(Number(amount))}
          </p>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {budget?.id ? 'Simpan' : 'Buat Anggaran'}
        </Button>
      </div>
    </div>
  )
}
