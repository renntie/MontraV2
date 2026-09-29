import { useState, useEffect } from 'react'
import { format, addMonths } from 'date-fns'
import { Tv, Music, Play, Wifi, Zap, Droplets, Dumbbell, Home, RefreshCw } from 'lucide-react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useWalletStore } from '@/store/walletStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/formatters'

const FREQUENCIES = [
  { id: 'daily',   label: 'Harian',   multiplier: 30 },
  { id: 'weekly',  label: 'Mingguan', multiplier: 4  },
  { id: 'monthly', label: 'Bulanan',  multiplier: 1  },
  { id: 'yearly',  label: 'Tahunan',  multiplier: 1/12 },
]

const PRESET_ICONS = [
  { label: 'Netflix',   icon: 'Tv',         IconCmp: Tv,         color: '#E50914' },
  { label: 'Spotify',   icon: 'Music',      IconCmp: Music,      color: '#1DB954' },
  { label: 'YouTube',   icon: 'Play',       IconCmp: Play,       color: '#FF0000' },
  { label: 'Internet',  icon: 'Wifi',       IconCmp: Wifi,       color: '#60A5FA' },
  { label: 'Listrik',   icon: 'Zap',        IconCmp: Zap,        color: '#FBBF24' },
  { label: 'Air',       icon: 'Droplets',   IconCmp: Droplets,   color: '#22D3EE' },
  { label: 'Gym',       icon: 'Dumbbell',   IconCmp: Dumbbell,   color: '#A78BFA' },
  { label: 'Kos/Sewa',  icon: 'Home',       IconCmp: Home,       color: '#F472B6' },
  { label: 'Lainnya',   icon: 'RefreshCw',  IconCmp: RefreshCw,  color: '#9CA3AF' },
]

export const SubscriptionForm = ({ subscription = null, onClose, onSaved }) => {
  const { user }     = useAuthStore()
  const { addToast } = useUIStore()
  const { categories } = useCategoryStore()
  const { wallets }    = useWalletStore()
  const { addSubscription, updateSubscription } = useSubscriptionStore()

  const [name,       setName]       = useState(subscription?.name || '')
  const [amount,     setAmount]     = useState(subscription?.amount?.toString() || '')
  const [frequency,  setFrequency]  = useState(subscription?.frequency || 'monthly')
  const [nextDue,    setNextDue]    = useState(subscription?.next_due || format(new Date(), 'yyyy-MM-dd'))
  const [categoryId, setCategoryId] = useState(subscription?.category_id || '')
  const [walletId,   setWalletId]   = useState(subscription?.wallet_id || '')
  const [note,       setNote]       = useState(subscription?.note || '')
  const [selectedIcon, setSelectedIcon] = useState('RefreshCw')
  const [selectedColor, setSelectedColor] = useState('#60A5FA')
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both')

  // Monthly equivalent for preview
  const freq = FREQUENCIES.find((f) => f.id === frequency) || FREQUENCIES[2]
  const monthlyEquivalent = Number(amount || 0) * freq.multiplier

  useEffect(() => {
    if (subscription) {
      setName(subscription.name || '')
      setAmount(subscription.amount?.toString() || '')
      setFrequency(subscription.frequency || 'monthly')
      setNextDue(subscription.next_due || format(new Date(), 'yyyy-MM-dd'))
      setCategoryId(subscription.category_id || '')
      setWalletId(subscription.wallet_id || '')
      setNote(subscription.note || '')
    }
  }, [subscription])

  const applyPreset = (preset) => {
    setName(preset.label)
    setSelectedIcon(preset.icon)
    setSelectedColor(preset.color)
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Masukkan nama langganan'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Masukkan jumlah yang valid'
    if (!nextDue) e.nextDue = 'Pilih tanggal jatuh tempo berikutnya'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        user_id:     user.id,
        name:        name.trim(),
        amount:      Number(amount),
        frequency,
        next_due:    nextDue,
        category_id: categoryId || null,
        wallet_id:   walletId   || null,
        note:        note.trim() || null,
        icon:        selectedIcon,
        color:       selectedColor,
        is_active:   true,
      }
      if (subscription?.id) {
        await updateSubscription(subscription.id, { ...subscription, ...payload })
        addToast('Langganan berhasil diperbarui')
      } else {
        await addSubscription(payload)
        addToast('Langganan berhasil ditambahkan')
      }
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
      {/* Preset Quick-Pick */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Pilih Cepat</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_ICONS.map((p) => {
            const isSelected = name === p.label
            const Icon = p.IconCmp
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150
                  ${isSelected ? 'text-white shadow-sm' : 'border-border bg-bg-elevated text-text-muted hover:border-border-strong'}`}
                style={isSelected ? { backgroundColor: p.color, borderColor: p.color } : {}}
              >
                <Icon size={13} strokeWidth={2.2} />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Input
        label="Nama Langganan"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
        placeholder="Netflix, Kos, Spotify..."
        error={errors.name}
      />

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Biaya</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: '' })) }}
            placeholder="0"
            className={`w-full bg-bg-elevated border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors
              ${errors.amount ? 'border-accent-expense' : 'border-border'}`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-accent-expense">{errors.amount}</p>}
        {Number(amount) > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            ≈ <span className="text-accent-expense font-semibold">{formatCurrency(monthlyEquivalent)}</span>/bulan
          </p>
        )}
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Frekuensi</label>
        <div className="grid grid-cols-4 gap-2">
          {FREQUENCIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFrequency(id)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                frequency === id
                  ? 'bg-accent-income text-bg shadow-sm'
                  : 'bg-bg-elevated text-text-muted hover:text-text-secondary border border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Jatuh Tempo Berikutnya"
        type="date"
        value={nextDue}
        onChange={(e) => { setNextDue(e.target.value); setErrors((p) => ({ ...p, nextDue: '' })) }}
        error={errors.nextDue}
      />

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Kategori <span className="text-text-muted font-normal">(opsional)</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-bg-elevated border border-border rounded-2xl px-4 py-3 text-sm text-text-primary outline-none
            focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
        >
          <option value="">-- Tanpa Kategori --</option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Wallet */}
      {wallets.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Dompet <span className="text-text-muted font-normal">(opsional)</span>
          </label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-2xl px-4 py-3 text-sm text-text-primary outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
          >
            <option value="">-- Semua Dompet --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      )}

      <Input label="Catatan" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detail tambahan..." hint="Opsional" />

      {/* Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {subscription?.id ? 'Simpan' : 'Tambah Langganan'}
        </Button>
      </div>
    </div>
  )
}
