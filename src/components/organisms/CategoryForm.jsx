import { useState, useEffect } from 'react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { ICON_LIST, DEFAULT_CATEGORY_COLORS } from '@/utils/categoryIcons'
import { useCategoryStore } from '@/store/categoryStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export const CategoryForm = ({ category = null, onClose }) => {
  const { user } = useAuthStore()
  const { addCategory, updateCategory } = useCategoryStore()
  const { addToast } = useUIStore()

  const [type,     setType]     = useState(category?.type  || 'expense')
  const [name,     setName]     = useState(category?.name  || '')
  const [icon,     setIcon]     = useState(category?.icon  || 'MoreHorizontal')
  const [color,    setColor]    = useState(category?.color || DEFAULT_CATEGORY_COLORS[0])
  const [loading,  setLoading]  = useState(false)
  const [nameError, setNameError] = useState('')

  // Sync when editing category changes
  useEffect(() => {
    if (category) {
      setType(category.type  || 'expense')
      setName(category.name  || '')
      setIcon(category.icon  || 'MoreHorizontal')
      setColor(category.color || DEFAULT_CATEGORY_COLORS[0])
    }
  }, [category])

  const handleSubmit = async () => {
    if (!name.trim()) { setNameError('Nama kategori tidak boleh kosong'); return }
    setNameError('')
    setLoading(true)
    try {
      const payload = {
        user_id:    user.id,
        name:       name.trim(),
        type,
        icon,
        color,
        is_default: false,
      }
      if (category?.id) {
        await updateCategory(category.id, payload)
        addToast('Kategori berhasil diperbarui')
      } else {
        await addCategory(payload)
        addToast('Kategori berhasil dibuat')
      }
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 space-y-5">
      {/* Type Switcher */}
      <div className="flex gap-1.5 bg-bg-elevated rounded-2xl p-1">
        {(['expense', 'income']).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              type === t
                ? 'bg-bg-overlay text-text-primary shadow-card'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Name */}
      <Input
        label="Nama Kategori"
        value={name}
        onChange={(e) => { setName(e.target.value); setNameError('') }}
        placeholder="Contoh: Belanja Online"
        error={nameError}
      />

      {/* Live Preview */}
      <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-2xl border border-border">
        <CategoryIcon iconName={icon} color={color} size={20} />
        <div>
          <p className="text-sm font-semibold text-text-primary">{name || 'Preview Kategori'}</p>
          <p className="text-xs text-text-muted">{type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Warna</label>
        <div className="flex gap-2.5 flex-wrap">
          {DEFAULT_CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all flex-shrink-0 ${
                color === c ? 'scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-bg-surface shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ background: c }}
              aria-label={`Warna ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Ikon</label>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-bg-elevated/40 rounded-2xl border border-border/60">
          {ICON_LIST.map(({ key, icon: iconName }) => (
            <button
              key={key}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                icon === iconName
                  ? 'border-accent-income bg-accent-income/15 scale-105 shadow-sm'
                  : 'border-transparent hover:bg-bg-overlay/80'
              }`}
            >
              <CategoryIcon iconName={iconName} color={color} size={16} className="!w-8 !h-8" />
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 -mx-5 -mb-5 p-4 bg-bg-surface/95 backdrop-blur-md border-t border-border flex gap-3 z-20">
        <Button variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {category?.id ? 'Simpan Perubahan' : 'Buat Kategori'}
        </Button>
      </div>
    </div>
  )
}
