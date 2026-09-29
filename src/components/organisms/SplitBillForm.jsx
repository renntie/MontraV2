import { useState } from 'react'
import { Plus, Minus, Users, Trash2, Info } from 'lucide-react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { debtService } from '@/services/debtService'
import { formatCurrency } from '@/utils/formatters'

const generateId = () => Math.random().toString(36).slice(2)

export const SplitBillForm = ({ onClose, onSaved }) => {
  const { user }     = useAuthStore()
  const { addToast } = useUIStore()

  const [billName,     setBillName]     = useState('')
  const [totalBill,    setTotalBill]    = useState('')
  const [tax,          setTax]          = useState('0')
  const [serviceCharge, setServiceCharge] = useState('0')
  const [participants, setParticipants] = useState([
    { id: generateId(), name: 'Saya', custom: '', isMe: true },
  ])
  const [splitMode,    setSplitMode]    = useState('equal') // 'equal' | 'custom'
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  const totalWithExtras = (Number(totalBill) || 0) + (Number(tax) || 0) + (Number(serviceCharge) || 0)
  const myParticipant   = participants.find((p) => p.isMe)

  const getShare = (p) => {
    if (splitMode === 'equal') {
      return participants.length > 0 ? totalWithExtras / participants.length : 0
    }
    return Number(p.custom) || 0
  }

  const myShare = myParticipant ? getShare(myParticipant) : 0

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { id: generateId(), name: '', custom: '', isMe: false }])
  }

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const updateParticipant = (id, field, value) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const validate = () => {
    const e = {}
    if (!billName.trim()) e.billName = 'Masukkan nama tagihan'
    if (!totalBill || Number(totalBill) <= 0) e.totalBill = 'Masukkan jumlah tagihan'
    if (participants.length < 2) e.participants = 'Tambahkan minimal 1 teman lagi'
    if (splitMode === 'custom') {
      const totalCustom = participants.reduce((s, p) => s + (Number(p.custom) || 0), 0)
      if (Math.abs(totalCustom - totalWithExtras) > 1) {
        e.customTotal = `Total custom (${formatCurrency(totalCustom)}) harus sama dengan total tagihan (${formatCurrency(totalWithExtras)})`
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // Buat debt "receivable" untuk setiap teman (bukan diri sendiri)
      const friends = participants.filter((p) => !p.isMe)
      const debtPromises = friends.map((p) =>
        debtService.create({
          user_id:     user.id,
          type:        'receivable',
          person_name: p.name.trim() || 'Teman',
          amount:      getShare(p),
          paid_amount: 0,
          status:      'unpaid',
          note:        `Split bill: ${billName.trim()}`,
          due_date:    null,
        })
      )
      await Promise.all(debtPromises)
      addToast(`Split bill berhasil! ${friends.length} piutang dibuat.`)
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
      {/* Info banner */}
      <div className="bg-accent-income/10 border border-accent-income/20 rounded-2xl p-3 flex items-start gap-2">
        <Info size={14} className="text-accent-income flex-shrink-0 mt-0.5" />
        <p className="text-xs text-accent-income leading-relaxed">
          Bagian teman-teman otomatis masuk ke <strong>Piutang</strong> kamu, bisa di-track di tab Hutang.
        </p>
      </div>

      <Input
        label="Nama Tagihan"
        value={billName}
        onChange={(e) => { setBillName(e.target.value); setErrors((p) => ({ ...p, billName: '' })) }}
        placeholder="Makan siang di Bebek Goreng..."
        error={errors.billName}
      />

      {/* Bill amounts */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Tagihan', value: totalBill, onChange: (v) => { setTotalBill(v); setErrors((p) => ({ ...p, totalBill: '' })) }, required: true },
          { label: 'Pajak (PB1)',   value: tax,       onChange: setTax,           required: false },
          { label: 'Service',       value: serviceCharge, onChange: setServiceCharge, required: false },
        ].map(({ label, value, onChange, required }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {label} {!required && <span className="text-text-muted font-normal text-[10px]">(opt)</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">Rp</span>
              <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0"
                className="w-full bg-bg-elevated border border-border rounded-2xl pl-7 pr-2 py-3
                  text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-accent-income/60 focus:ring-1 focus:ring-accent-income/20 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
      {errors.totalBill && <p className="-mt-2 text-xs text-accent-expense">{errors.totalBill}</p>}

      {/* Grand total display */}
      {Number(totalBill) > 0 && (
        <div className="bg-bg-elevated rounded-2xl px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-text-muted">Total setelah pajak & service:</span>
          <span className="text-sm font-bold text-text-primary">{formatCurrency(totalWithExtras)}</span>
        </div>
      )}

      {/* Split mode */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Cara Bagi</label>
        <div className="flex gap-1.5 bg-bg-elevated rounded-2xl p-1">
          {[['equal', 'Rata'], ['custom', 'Custom']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSplitMode(val)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                splitMode === val ? 'bg-bg-surface text-text-primary shadow-card' : 'text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-text-secondary">
            Peserta ({participants.length} orang)
          </label>
          <button
            type="button"
            onClick={addParticipant}
            className="flex items-center gap-1 text-xs text-accent-income font-semibold hover:opacity-80 transition-opacity"
          >
            <Plus size={12} /> Tambah Teman
          </button>
        </div>
        {errors.participants && <p className="text-xs text-accent-expense mb-2">{errors.participants}</p>}

        <div className="space-y-2">
          {participants.map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-2 bg-bg-elevated rounded-2xl px-3 py-2.5
              ${p.isMe ? 'border border-accent-income/30' : 'border border-transparent'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                p.isMe ? 'bg-accent-income text-bg' : 'bg-bg-overlay text-text-muted'
              }`}>
                {p.isMe ? 'Me' : idx}
              </div>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateParticipant(p.id, 'name', e.target.value)}
                placeholder={p.isMe ? 'Kamu' : `Teman ${idx}`}
                disabled={p.isMe}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none disabled:opacity-60"
              />
              {splitMode === 'custom' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-muted">Rp</span>
                  <input
                    type="number"
                    value={p.custom}
                    onChange={(e) => updateParticipant(p.id, 'custom', e.target.value)}
                    placeholder="0"
                    className="w-20 bg-bg-overlay rounded-xl px-2 py-1 text-xs text-text-primary outline-none"
                  />
                </div>
              )}
              {splitMode === 'equal' && (
                <span className="text-xs font-semibold text-accent-income flex-shrink-0">
                  {formatCurrency(getShare(p), { compact: true })}
                </span>
              )}
              {!p.isMe && (
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  className="text-text-muted hover:text-accent-expense transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.customTotal && (
          <p className="mt-1 text-xs text-accent-expense">{errors.customTotal}</p>
        )}
      </div>

      {/* My share summary */}
      {Number(totalBill) > 0 && (
        <div className="bg-accent-income/10 border border-accent-income/20 rounded-2xl p-4">
          <p className="text-xs text-accent-income mb-1">Bagianmu</p>
          <p className="text-xl font-extrabold text-accent-income">{formatCurrency(myShare)}</p>
          {participants.length > 1 && (
            <p className="text-xs text-text-muted mt-1">
              {participants.length - 1} piutang ({formatCurrency(totalWithExtras - myShare)}) akan dibuat otomatis
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-6 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20 mt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1" icon={Users}>
          Buat Piutang
        </Button>
      </div>
    </div>
  )
}
