import { useState, useEffect } from 'react'
import { Wallet, Building2, Smartphone, TrendingUp, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWalletStore } from '@/store/walletStore'

const WALLET_TYPES = [
  { id: 'cash',       label: 'Tunai',      icon: Wallet,       color: '#34D399' },
  { id: 'bank',       label: 'Bank',       icon: Building2,    color: '#60A5FA' },
  { id: 'ewallet',    label: 'E-Wallet',   icon: Smartphone,   color: '#A78BFA' },
  { id: 'investment', label: 'Investasi',  icon: TrendingUp,   color: '#FBBF24' },
  { id: 'other',      label: 'Lainnya',    icon: MoreHorizontal, color: '#9CA3AF' },
]

const TYPE_ICONS = {
  cash:       'Wallet',
  bank:       'Building2',
  ewallet:    'Smartphone',
  investment: 'TrendingUp',
  other:      'MoreHorizontal',
}

export const WalletForm = ({ wallet = null, onClose, onSaved }) => {
  const { user }       = useAuthStore()
  const { addToast }   = useUIStore()
  const { addWallet, updateWallet, fetchWallets } = useWalletStore()

  const [name,    setName]    = useState(wallet?.name    || '')
  const [type,    setType]    = useState(wallet?.type    || 'cash')
  const [balance, setBalance] = useState(wallet?.initial_balance?.toString() || '0')
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const selectedType = WALLET_TYPES.find((t) => t.id === type) || WALLET_TYPES[0]

  useEffect(() => {
    if (wallet) {
      setName(wallet.name || '')
      setType(wallet.type || 'cash')
      setBalance(wallet.initial_balance?.toString() || '0')
    }
  }, [wallet])

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Masukkan nama dompet'
    if (isNaN(Number(balance))) e.balance = 'Masukkan saldo yang valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const wtype = WALLET_TYPES.find((t) => t.id === type)
      const payload = {
        user_id:         user.id,
        name:            name.trim(),
        type,
        icon:            TYPE_ICONS[type],
        color:           wtype?.color || '#34D399',
        initial_balance: Number(balance) || 0,
      }
      if (wallet?.id) {
        await updateWallet(wallet.id, { ...wallet, ...payload })
        addToast('Dompet berhasil diperbarui')
      } else {
        await addWallet(payload)
        addToast('Dompet berhasil ditambahkan')
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
    <div className="p-5 space-y-5 pb-6">
      {/* Type Picker */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Tipe Dompet</label>
        <div className="grid grid-cols-5 gap-2">
          {WALLET_TYPES.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setType(id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-200 ${
                type === id
                  ? 'border-transparent shadow-sm'
                  : 'border-border bg-bg-elevated hover:border-border-strong'
              }`}
              style={type === id ? { backgroundColor: color + '22', borderColor: color + '66' } : {}}
            >
              <Icon size={18} style={{ color: type === id ? color : undefined }} className={type === id ? '' : 'text-text-muted'} />
              <span className="text-[9px] font-semibold" style={{ color: type === id ? color : undefined }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Nama Dompet"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
        placeholder={`Contoh: ${type === 'bank' ? 'BCA Tabungan' : type === 'ewallet' ? 'GoPay' : 'Dompet Tunai'}...`}
        error={errors.name}
      />

      {/* Saldo Awal */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Saldo Awal <span className="text-text-muted font-normal">(opsional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
          <input
            type="number"
            value={balance}
            onChange={(e) => { setBalance(e.target.value); setErrors((p) => ({ ...p, balance: '' })) }}
            placeholder="0"
            className={`w-full bg-bg-elevated border rounded-2xl pl-10 pr-4 py-3
              text-sm text-text-primary placeholder:text-text-muted outline-none
              focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors
              ${errors.balance ? 'border-accent-expense' : 'border-border'}`}
          />
        </div>
        {errors.balance && <p className="mt-1 text-xs text-accent-expense">{errors.balance}</p>}
        <p className="mt-1 text-xs text-text-muted">Saldo saat ini di dompet ini sebelum mulai mencatat di Montra.</p>
      </div>

      {/* Preview */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ backgroundColor: selectedType.color + '15', borderColor: selectedType.color + '30', border: '1px solid' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: selectedType.color + '25' }}>
          <selectedType.icon size={20} style={{ color: selectedType.color }} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{name || 'Nama Dompet'}</p>
          <p className="text-xs text-text-muted">{selectedType.label} · Rp {Number(balance || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {wallet?.id ? 'Simpan' : 'Tambah Dompet'}
        </Button>
      </div>
    </div>
  )
}
