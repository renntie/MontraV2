import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export const TransactionForm = ({ editingTransaction = null, onClose }) => {
  const { user } = useAuthStore()
  const { addTransaction, updateTransaction, fetchSummary, fetchCategoryBreakdown } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { addToast } = useUIStore()

  const [type,       setType]       = useState(editingTransaction?.type       || 'expense')
  const [amount,     setAmount]     = useState(editingTransaction?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(editingTransaction?.category_id || '')
  const [note,       setNote]       = useState(editingTransaction?.note        || '')
  const [date,       setDate]       = useState(editingTransaction?.date        || format(new Date(), 'yyyy-MM-dd'))
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})

  // Reset when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense')
      setAmount(editingTransaction.amount?.toString() || '')
      setCategoryId(editingTransaction.category_id || '')
      setNote(editingTransaction.note || '')
      setDate(editingTransaction.date || format(new Date(), 'yyyy-MM-dd'))
    }
  }, [editingTransaction])

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  )

  const validate = () => {
    const e = {}
    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) e.amount = 'Masukkan jumlah yang valid'
    if (!categoryId)                       e.category = 'Pilih kategori'
    if (!date)                             e.date = 'Pilih tanggal'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        user_id:     user.id,
        type,
        amount:      Number(amount),
        category_id: categoryId,
        note:        note.trim() || null,
        date,
      }
      if (editingTransaction?.id) {
        await updateTransaction(editingTransaction.id, payload)
        addToast('Transaksi berhasil diperbarui')
      } else {
        await addTransaction(payload)
        addToast('Transaksi berhasil ditambahkan')
      }
      await Promise.all([
        fetchSummary(user.id),
        fetchCategoryBreakdown(user.id),
      ])
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Format amount display with thousand separators
  const displayAmount = amount
    ? new Intl.NumberFormat('id-ID').format(Number(amount.replace(/\D/g, '')))
    : ''

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setAmount(raw)
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
  }

  return (
    <div className="p-5 space-y-5 pb-6">
      {/* Type Switcher */}
      <div className="flex gap-1.5 bg-bg-elevated rounded-2xl p-1">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === t
                ? t === 'income'
                  ? 'bg-accent-income text-bg shadow-sm'
                  : 'bg-accent-expense text-white shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Amount Field */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Jumlah</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="0"
            className={`w-full bg-bg-elevated border rounded-2xl pl-10 pr-4 py-3.5
              text-2xl font-extrabold text-text-primary placeholder:text-text-muted/40
              outline-none transition-colors
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20
              ${errors.amount ? 'border-accent-expense' : 'border-border'}`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-accent-expense">{errors.amount}</p>
        )}
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Kategori</label>
        {filteredCategories.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-3">
            Belum ada kategori. Buat di Pengaturan.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.map((cat) => {
              const isSelected = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setErrors((p) => ({ ...p, category: '' })) }}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-accent-income/50 bg-accent-income/5 shadow-sm'
                      : 'border-border hover:border-border-strong hover:bg-bg-elevated'
                  }`}
                >
                  <CategoryIcon
                    iconName={cat.icon}
                    color={cat.color}
                    size={16}
                    className="!w-9 !h-9"
                  />
                  <span className="text-[10px] text-text-secondary text-center leading-tight truncate w-full">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {errors.category && (
          <p className="mt-1 text-xs text-accent-expense">{errors.category}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Catatan <span className="text-text-muted font-normal">(opsional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambahkan catatan..."
          className="w-full bg-bg-elevated border border-border rounded-2xl px-4 py-3
            text-sm text-text-primary placeholder:text-text-muted outline-none
            focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
        />
      </div>

      {/* Date */}
      <Input
        label="Tanggal"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Batal
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {editingTransaction?.id ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
      </div>
    </div>
  )
}
