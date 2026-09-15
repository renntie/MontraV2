import { useState, useEffect } from 'react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { savingsService } from '@/services/savingsService'
import { formatCurrency } from '@/utils/formatters'

// Emoji picker list for savings goal icon
const GOAL_EMOJIS = ['💰','🏠','🚗','✈️','💻','📱','🎮','🏖','🎓','💍','🏋️','📷','🎸','👶','🏥','🐶']

export const SavingsForm = ({ saving = null, onClose, onSaved }) => {
  const { user }     = useAuthStore()
  const { addToast } = useUIStore()

  const [name,          setName]          = useState(saving?.name          || '')
  const [emoji,         setEmoji]         = useState(saving?.emoji         || '💰')
  const [targetAmount,  setTargetAmount]  = useState(saving?.target_amount?.toString()  || '')
  const [currentAmount, setCurrentAmount] = useState(saving?.current_amount?.toString() || '0')
  const [deadline,      setDeadline]      = useState(saving?.deadline      || '')
  const [loading,       setLoading]       = useState(false)
  const [errors,        setErrors]        = useState({})

  useEffect(() => {
    if (saving) {
      setName(saving.name || '')
      setEmoji(saving.emoji || '💰')
      setTargetAmount(saving.target_amount?.toString() || '')
      setCurrentAmount(saving.current_amount?.toString() || '0')
      setDeadline(saving.deadline || '')
    }
  }, [saving])

  const validate = () => {
    const e = {}
    if (!name.trim())                                              e.name = 'Nama target tidak boleh kosong'
    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0)
      e.target = 'Masukkan jumlah target yang valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        user_id:        user.id,
        name:           name.trim(),
        emoji,
        target_amount:  Number(targetAmount),
        current_amount: Math.max(0, Number(currentAmount) || 0),
        deadline:       deadline || null,
      }
      if (saving?.id) {
        await savingsService.update(saving.id, payload)
        addToast('Target tabungan diperbarui')
      } else {
        await savingsService.create(payload)
        addToast('Target tabungan berhasil dibuat 🎯')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const remaining = Number(targetAmount) - Number(currentAmount)

  return (
    <div className="p-5 space-y-4 pb-6">
      {/* Emoji Picker */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Ikon Goal</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${
                emoji === e
                  ? 'bg-accent-income/15 ring-2 ring-accent-income/40 scale-110'
                  : 'bg-bg-elevated hover:bg-bg-overlay'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <Input
        label="Nama Target"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
        placeholder="Contoh: Beli Laptop Baru"
        error={errors.name}
      />

      {/* Target Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Dana Target</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => { setTargetAmount(e.target.value); setErrors((p) => ({ ...p, target: '' })) }}
            placeholder="5000000"
            className={`w-full bg-bg-elevated border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors
              ${errors.target ? 'border-accent-expense' : 'border-border'}`}
          />
        </div>
        {errors.target && <p className="mt-1 text-xs text-accent-expense">{errors.target}</p>}
      </div>

      {/* Current Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Dana Saat Ini <span className="text-text-muted font-normal">(sudah terkumpul)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
          <input
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-bg-elevated border border-border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
          />
        </div>
        {Number(targetAmount) > 0 && Number(currentAmount) >= 0 && (
          <p className="mt-1 text-xs text-text-muted">
            Masih perlu: <span className="text-accent-income font-semibold">
              {formatCurrency(Math.max(0, remaining))}
            </span>
          </p>
        )}
      </div>

      {/* Deadline */}
      <Input
        label="Deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        hint="Opsional — bantu kamu tetap termotivasi"
      />

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {saving?.id ? 'Simpan' : 'Buat Target'}
        </Button>
      </div>
    </div>
  )
}
