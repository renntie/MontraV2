import { useState, useEffect } from 'react'
import { Palette, Check, Sparkles, Sun, Moon } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { useUIStore } from '@/store/uiStore'

export const THEMES = [
  // ── Dark Themes ──
  {
    id: 'default',
    name: 'Montra Dark',
    description: 'Tema default yang nyaman di mata',
    mode: 'dark',
    preview: { bg: '#121212', surface: '#1E1E1E', income: '#34D399', expense: '#FB7185' },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Biru gelap yang tenang & profesional',
    mode: 'dark',
    preview: { bg: '#0F172A', surface: '#1E293B', income: '#38BDF8', expense: '#F87171' },
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    description: 'Abu-abu netral yang elegan',
    mode: 'dark',
    preview: { bg: '#18181B', surface: '#27272A', income: '#A78BFA', expense: '#FB923C' },
  },
  // ── Light Themes ──
  {
    id: 'light',
    name: 'Montra Light',
    description: 'Terang, bersih, dan minimalis',
    mode: 'light',
    preview: { bg: '#F8FAFC', surface: '#FFFFFF', income: '#059669', expense: '#E11D48' },
  },
  {
    id: 'cream',
    name: 'Warm Cream',
    description: 'Hangat dan lembut seperti kertas',
    mode: 'light',
    preview: { bg: '#FFFBF0', surface: '#FFFFFF', income: '#16A34A', expense: '#DC2626' },
  },
  {
    id: 'snow',
    name: 'Arctic Snow',
    description: 'Putih bersih dengan aksen biru',
    mode: 'light',
    preview: { bg: '#F0F4F8', surface: '#FFFFFF', income: '#2563EB', expense: '#E11D48' },
  },
]

export const ThemeCustomizer = () => {
  const { addToast } = useUIStore()
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('montra_theme') || 'default'
    }
    return 'default'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
  }, [activeTheme])

  const handleSelectTheme = (themeId, themeName) => {
    setActiveTheme(themeId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('montra_theme', themeId)
      document.documentElement.setAttribute('data-theme', themeId)
    }
    addToast(`Tema "${themeName}" diaktifkan!`)
  }

  const darkThemes = THEMES.filter(t => t.mode === 'dark')
  const lightThemes = THEMES.filter(t => t.mode === 'light')

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-accent-income/15 border border-accent-income/30 flex items-center justify-center text-accent-income">
          <Palette size={20} />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
            Tema Warna <Sparkles size={13} className="text-accent-yellow" />
          </h2>
          <p className="text-xs text-text-muted">Pilih tampilan yang paling nyaman buatmu</p>
        </div>
      </div>

      {/* Dark Themes */}
      <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Moon size={11} /> Mode Gelap
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {darkThemes.map((theme) => (
            <ThemeButton
              key={theme.id}
              theme={theme}
              isActive={activeTheme === theme.id}
              onSelect={handleSelectTheme}
            />
          ))}
        </div>
      </div>

      {/* Light Themes */}
      <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Sun size={11} /> Mode Terang
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {lightThemes.map((theme) => (
            <ThemeButton
              key={theme.id}
              theme={theme}
              isActive={activeTheme === theme.id}
              onSelect={handleSelectTheme}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

const ThemeButton = ({ theme, isActive, onSelect }) => (
  <button
    onClick={() => onSelect(theme.id, theme.name)}
    className={`p-2.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group ${
      isActive
        ? 'ring-2 ring-accent-income/40 border-accent-income scale-[1.02]'
        : 'border-border hover:border-border-strong'
    }`}
  >
    {/* Mini preview card */}
    <div
      className="w-full h-12 rounded-xl mb-2 flex items-end p-1.5 gap-1 transition-transform duration-200 group-hover:scale-[1.03]"
      style={{
        backgroundColor: theme.preview.bg,
        border: `1px solid ${theme.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div
        className="flex-1 h-5 rounded-md"
        style={{ backgroundColor: theme.preview.surface }}
      />
      <div className="flex flex-col gap-0.5">
        <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: theme.preview.income }} />
        <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: theme.preview.expense }} />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold text-text-primary truncate">{theme.name}</p>
      {isActive && (
        <span className="w-4 h-4 rounded-full bg-accent-income text-bg flex items-center justify-center flex-shrink-0">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
    </div>
    <p className="text-[9px] text-text-muted mt-0.5 truncate">{theme.description}</p>
  </button>
)
