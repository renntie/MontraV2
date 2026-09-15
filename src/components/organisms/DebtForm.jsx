import { useState, useEffect } from 'react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { debtService } from '@/services/debtService'
import { formatCurrency } from '@/utils/formatters'

export const DebtForm = ({ debt = null, onClose, onSaved }) => {
  const { user }     = useAuthStore()
  const { addToast } = useUIStore()

  const [type,       setType]       = useState(debt?.type        || 'payable')
  const [personName, setPersonName] = useState(debt?.person_name || '')
  const [amount,     setAmount]     = useState(debt?.amount?.toString()      || '')
  const [paidAmount, setPaidAmount] = useState(debt?.paid_amount?.toString() || '0')
  const [dueDate,    setDueDate]    = useState(debt?.due_date    || '')
  const [note,       setNote]       = useState(debt?.note        || '')
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})

  useEffect(() => {
    if (debt) {
      setType(debt.type || 'payable')
      setPersonName(debt.person_name || '')
      setAmount(debt.amount?.toString() || '')
      setPaidAmount(debt.paid_amount?.toString() || '0')
      setDueDate(debt.due_date || '')
      setNote(debt.note || '')
    }
  }, [debt])

  const validate = () => {
    const e = {}
    if (!personName.trim()) e.personName = 'Masukkan nama orang'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = 'Masukkan jumlah yang valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const totalAmount = Number(amount)
      const paid        = Math.min(Number(paidAmount) || 0, totalAmount)
      const payload = {
        user_id:     user.id,
        type,
        person_name: personName.trim(),
        amount:      totalAmount,
        paid_amount: paid,
        due_date:    dueDate || null,
        note:        note.trim() || null,
        status:      paid >= totalAmount ? 'paid' : 'unpaid',
      }
      if (debt?.id) {
        await debtService.update(debt.id, payload)
        addToast('Catatan berhasil diperbarui')
      } else {
        await debtService.create(payload)
        addToast('Catatan berhasil ditambahkan')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const remaining = Math.max(0, Number(amount) - Number(paidAmount))

  return (
    <div className="p-5 space-y-4 pb-6">
      {/* Type Switcher */}
      <div className="flex gap-1.5 bg-bg-elevated rounded-2xl p-1">
        {[
          ['payable',    '💳 Hutang Saya'],
          ['receivable', '📥 Piutang Saya'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setType(val)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              type === val
                ? val === 'receivable'
                  ? 'bg-accent-income text-bg shadow-sm'
                  : 'bg-accent-expense text-white shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-text-muted -mt-2 px-1">
        {type === 'payable'
          ? '💡 Hutang: kamu yang berutang kepada orang lain'
          : '💡 Piutang: orang lain yang berutang kepadamu'}
      </p>

      <Input
        label="Nama Orang"
        value={personName}
        onChange={(e) => { setPersonName(e.target.value); setErrors((p) => ({ ...p, personName: '' })) }}
        placeholder="Nama teman atau saudara..."
        error={errors.personName}
      />

      {/* Total Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Jumlah Total</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
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
      </div>

      {/* Paid Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Sudah Dibayar <span className="text-text-muted font-normal">(jika ada)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-bg-elevated border border-border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
          />
        </div>
        {Number(amount) > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            Sisa: <span className={`font-semibold ${remaining > 0 ? 'text-accent-expense' : 'text-accent-income'}`}>
              {remaining > 0 ? formatCurrency(remaining) : 'Lunas ✓'}
            </span>
          </p>
        )}
      </div>

      <Input
        label="Jatuh Tempo"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        hint="Opsional"
      />

      <Input
        label="Catatan"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Detail transaksi..."
        hint="Opsional"
      />

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {debt?.id ? 'Simpan' : 'Tambah Catatan'}
        </Button>
      </div>
    </div>
  )
}
