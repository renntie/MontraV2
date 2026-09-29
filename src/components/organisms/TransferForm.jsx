import { useState, useEffect } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWalletStore } from '@/store/walletStore'
import { transferService } from '@/services/transferService'
import { formatCurrency } from '@/utils/formatters'

const TYPE_LABEL = {
  cash:       'Tunai',
  bank:       'Bank',
  ewallet:    'E-Wallet',
  investment: 'Investasi',
  other:      'Lainnya',
}

export const TransferForm = ({ transfer = null, onClose, onSaved }) => {
  const { user }       = useAuthStore()
  const { addToast }   = useUIStore()
  const { wallets, balances, refreshBalance } = useWalletStore()

  const [fromId,   setFromId]  = useState(transfer?.from_wallet_id || '')
  const [toId,     setToId]    = useState(transfer?.to_wallet_id   || '')
  const [amount,   setAmount]  = useState(transfer?.amount?.toString() || '')
  const [note,     setNote]    = useState(transfer?.note || '')
  const [date,     setDate]    = useState(transfer?.date || format(new Date(), 'yyyy-MM-dd'))
  const [loading,  setLoading] = useState(false)
  const [errors,   setErrors]  = useState({})

  const fromWallet = wallets.find((w) => w.id === fromId)
  const toWallet   = wallets.find((w) => w.id === toId)

  const validate = () => {
    const e = {}
    if (!fromId)  e.from   = 'Pilih dompet asal'
    if (!toId)    e.to     = 'Pilih dompet tujuan'
    if (fromId && toId && fromId === toId) e.to = 'Dompet asal dan tujuan harus berbeda'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Masukkan jumlah yang valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        user_id:        user.id,
        from_wallet_id: fromId,
        to_wallet_id:   toId,
        amount:         Number(amount),
        note:           note.trim() || null,
        date,
      }
      if (transfer?.id) {
        await transferService.update(transfer.id, { ...transfer, ...payload })
        addToast('Transfer berhasil diperbarui')
      } else {
        await transferService.create(payload)
        addToast('Transfer berhasil dicatat')
      }
      // refresh saldo kedua dompet
      await Promise.all([refreshBalance(fromId), refreshBalance(toId)])
      onSaved?.()
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const WalletOption = ({ label, value, onChange, error }) => (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => { onChange(e.target.value); setErrors((p) => ({ ...p, from: '', to: '' })) }}
        className={`w-full bg-bg-elevated border rounded-2xl px-4 py-3 text-sm text-text-primary outline-none
          focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors
          ${error ? 'border-accent-expense' : 'border-border'}`}
      >
        <option value="">-- Pilih Dompet --</option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            [{TYPE_LABEL[w.type] || 'Dompet'}] {w.name} · {formatCurrency(balances[w.id] ?? 0, { compact: true })}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-accent-expense">{error}</p>}
    </div>
  )

  return (
    <div className="p-5 space-y-4 pb-6">
      {wallets.length < 2 && (
        <div className="bg-accent-income/10 border border-accent-income/20 rounded-2xl p-3 text-xs text-accent-income flex items-center gap-2">
          <Info size={16} className="flex-shrink-0" />
          <span>Kamu perlu minimal 2 dompet untuk melakukan transfer. Buat dompet baru terlebih dahulu.</span>
        </div>
      )}

      {/* From → To visual */}
      {(fromWallet || toWallet) && (
        <div className="flex items-center gap-2 bg-bg-elevated rounded-2xl p-3">
          <div className="flex-1 text-center">
            <p className="text-xs text-text-muted">Dari</p>
            <p className="text-sm font-bold text-text-primary truncate">{fromWallet?.name || '—'}</p>
            {fromWallet && <p className="text-xs text-accent-expense">{formatCurrency(balances[fromId] ?? 0, { compact: true })}</p>}
          </div>
          <div className="w-8 h-8 rounded-xl bg-bg-overlay flex items-center justify-center flex-shrink-0">
            <ArrowRight size={16} className="text-text-muted" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-text-muted">Ke</p>
            <p className="text-sm font-bold text-text-primary truncate">{toWallet?.name || '—'}</p>
            {toWallet && <p className="text-xs text-accent-income">{formatCurrency(balances[toId] ?? 0, { compact: true })}</p>}
          </div>
        </div>
      )}

      <WalletOption label="Dari Dompet" value={fromId} onChange={setFromId} error={errors.from} />
      <WalletOption label="Ke Dompet"   value={toId}   onChange={setToId}   error={errors.to}   />

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Jumlah Transfer</label>
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
      </div>

      <Input label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="Catatan" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Top up GoPay dari BCA..." hint="Opsional" />

      {/* Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} disabled={wallets.length < 2} className="flex-1">
          {transfer?.id ? 'Simpan' : 'Catat Transfer'}
        </Button>
      </div>
    </div>
  )
}
