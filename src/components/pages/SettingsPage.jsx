import { useState } from 'react'
import {
  LogOut, Plus, Pencil, Trash2, Download, Shield, Bell,
  ChevronRight, Heart, ExternalLink, Smartphone, Sparkles,
  ArrowLeft, Code2,
} from 'lucide-react'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { CategoryIcon } from '@/components/atoms/CategoryIcon'
import { MontraLogo } from '@/components/atoms/MontraLogo'
import { useAuthStore } from '@/store/authStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useUIStore } from '@/store/uiStore'
import { useInstallPWA } from '@/hooks/useInstallPWA'

const SOCIABUZZ_URL = 'https://sociabuzz.com/lilramm'
const WA_URL = 'https://wa.me/6285147142116?text=Halo%20Ram,%20saya%20pengguna%20Montra...'

export const SettingsPage = () => {
  const { user, signOut }              = useAuthStore()
  const { categories, deleteCategory } = useCategoryStore()
  const { addToast, openCategoryModal, setActiveRoute } = useUIStore()
  const { canInstall, install, installed } = useInstallPWA()

  const [tab, setTab] = useState('account')
  const [installing, setInstalling] = useState(false)

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna'
  const email = user?.email || ''
  const defaultCats = categories.filter((c) => c.is_default)
  const customCats = categories.filter((c) => !c.is_default)

  const handleSignOut = async () => {
    if (!confirm('Yakin ingin keluar?')) return
    await signOut()
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try { await deleteCategory(id); addToast('Kategori dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleInstall = async () => {
    if (canInstall) {
      setInstalling(true)
      const accepted = await install()
      setInstalling(false)
      if (accepted) addToast('Montra berhasil diinstall!')
    } else {
      addToast('Ketuk menu titik tiga (⋮) di pojok atas browser, lalu pilih "Tambahkan ke Layar Utama" / "Install Aplikasi"', 'info')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveRoute('dashboard')}
            aria-label="Kembali"
            className="lg:hidden h-9 w-9 rounded-2xl bg-bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-extrabold text-text-primary">Pengaturan</h1>
        </div>

        <div className="flex gap-1 p-1 bg-bg-elevated rounded-2xl">
          {[['account', 'Akun'], ['categories', 'Kategori'], ['app', 'Aplikasi']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ${
                tab === val
                  ? 'bg-bg-surface text-text-primary shadow-card scale-[1.02]'
                  : 'text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 scrollbar-hide">
        <div key={tab} className="page-enter space-y-4">

          {/* ACCOUNT */}
          {tab === 'account' && (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar name={name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-text-primary truncate">{name}</p>
                    <p className="text-sm text-text-muted truncate">{email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-income animate-pulse-soft" />
                      <span className="text-xs text-accent-income font-semibold">Aktif</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden divide-y divide-border">
                {[{ icon: Shield, label: 'Keamanan', desc: 'Password & autentikasi dua faktor' },
                  { icon: Bell,   label: 'Notifikasi', desc: 'Pengingat & alert anggaran' }
                ].map(({ icon: Icon, label, desc }) => (
                  <button
                    key={label}
                    className="w-full flex items-center justify-between px-4 py-3.5
                      hover:bg-bg-elevated transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bg-elevated group-hover:bg-bg-overlay
                        flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                        <Icon size={16} className="text-text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-text-primary">{label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-text-muted opacity-40
                      transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5
                    hover:bg-accent-expense/5 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent-expense/10
                    flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <LogOut size={16} className="text-accent-expense" />
                  </div>
                  <span className="text-sm font-medium text-accent-expense">Keluar dari Akun</span>
                </button>
              </Card>
            </>
          )}

          {/* CATEGORIES */}
          {tab === 'categories' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Kustom ({customCats.length})</p>
                  <button
                    onClick={() => openCategoryModal(null)}
                    className="flex items-center gap-1 text-xs font-bold text-accent-income hover:underline"
                  >
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                {customCats.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-text-muted mb-3">Belum ada kategori kustom</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Plus}
                      onClick={() => openCategoryModal(null)}
                    >
                      Buat Kategori
                    </Button>
                  </Card>
                ) : (
                  <Card className="overflow-hidden divide-y divide-border">
                    {customCats.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 px-4 py-3 group
                          hover:bg-bg-elevated transition-colors duration-150"
                      >
                        <CategoryIcon iconName={cat.icon} color={cat.color} size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                          <p className="text-xs text-text-muted">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => openCategoryModal(cat)}
                            aria-label="Edit kategori"
                            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-overlay
                              transition-all duration-150 hover:scale-110"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            aria-label="Hapus kategori"
                            className="p-1.5 rounded-xl text-text-muted hover:text-accent-expense hover:bg-accent-expense/10
                              transition-all duration-150 hover:scale-110"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Default ({defaultCats.length})
                </p>
                <Card className="overflow-hidden divide-y divide-border">
                  {defaultCats.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                      <CategoryIcon iconName={cat.icon} color={cat.color} size={16} />
                      <p className="text-sm text-text-primary flex-1">{cat.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        cat.type === 'income'
                          ? 'bg-accent-income/10 text-accent-income'
                          : 'bg-accent-expense/10 text-accent-expense'
                      }`}>
                        {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>
            </>
          )}

          {/* APP */}
          {tab === 'app' && (
            <>
              {/* Install PWA Banner */}
              <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300
                ${installed
                  ? 'bg-accent-income/5 border-accent-income/20'
                  : 'bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/25'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                    ${installed ? 'bg-accent-income/20 text-accent-income' : 'bg-accent-blue/20 text-accent-blue'}`}>
                    <Smartphone size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-text-primary mb-1">
                      {installed ? 'Montra Sudah Terinstall' : 'Install Aplikasi Montra'}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed mb-3">
                      {installed
                        ? 'Aplikasi berjalan secara native di perangkat Anda, mendukung akses offline dan notifikasi.'
                        : 'Install di HP atau desktop untuk pengalaman yang lebih cepat, ringan, dan bisa dibuka tanpa browser.'}
                    </p>
                    {!installed && (
                      <Button
                        size="sm"
                        icon={Download}
                        loading={installing}
                        onClick={handleInstall}
                      >
                        {canInstall ? 'Install Sekarang' : 'Gunakan Menu Browser untuk Install'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Support Developer */}
              <div className="relative overflow-hidden rounded-3xl p-5 border border-accent-sociabuzz/25
                bg-gradient-to-br from-accent-sociabuzz/8 via-bg-surface to-accent-purple/8 group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent-sociabuzz/10
                  -translate-y-6 translate-x-6 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl sociabuzz-gradient flex items-center justify-center
                      flex-shrink-0 shadow-glow-sociabuzz/30
                      transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Heart size={22} className="text-white" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold gradient-text-sociabuzz">Support Developer</p>
                      <p className="text-xs text-text-muted">Bantu kami terus berkembang</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    Montra dibuat sebagai aplikasi gratis. Jika kamu merasa terbantu,
                    pertimbangkan untuk mentraktir kopi agar kami bisa terus menambah fitur baru.
                  </p>
                  <a
                    href={SOCIABUZZ_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl
                      sociabuzz-gradient text-white text-sm font-bold
                      hover:brightness-110 active:scale-[0.98] transition-all duration-200
                      shadow-glow-sociabuzz/25 hover:shadow-glow-sociabuzz/40"
                  >
                    <Heart size={15} fill="currentColor" />
                    Dukung di Sociabuzz
                    <ExternalLink size={13} className="ml-auto opacity-70" />
                  </a>
                </div>
              </div>

              {/* Developer Contact & Feedback Card */}
              <div className="relative overflow-hidden rounded-3xl p-5 border border-emerald-500/25
                bg-gradient-to-br from-emerald-500/10 via-bg-surface to-accent-income/5 group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/10
                  -translate-y-6 translate-x-6 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center
                      flex-shrink-0 text-emerald-400 shadow-glow-income/20
                      transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Code2 size={24} className="text-emerald-400" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-extrabold text-text-primary">Developer</p>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                          Ram
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">Pengembang Aplikasi Montra</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    Jika menemukan bug atau ingin menambahkan fitur, silakan hubungi nomor di bawah ini:
                  </p>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl
                      bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold
                      hover:brightness-110 active:scale-[0.98] transition-all duration-200
                      shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35"
                  >
                    <WhatsAppIcon className="w-5 h-5 fill-current text-white" />
                    <span>Chat WhatsApp (0851-4714-2116)</span>
                    <ExternalLink size={14} className="ml-auto opacity-75" />
                  </a>
                </div>
              </div>

              {/* App Info */}
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <MontraLogo size="md" showText={false} />
                  <div>
                    <p className="text-base font-extrabold text-text-primary flex items-center gap-1.5">
                      Montra <Sparkles size={13} className="text-accent-yellow" />
                    </p>
                    <p className="text-xs text-text-muted">Personal Finance · v2.0.0</p>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  Aplikasi manajemen keuangan pribadi yang simpel, cepat, dan elegan.
                  Data tersimpan aman di cloud Supabase.
                </p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-border pt-4">
                  {[['Frontend', 'React 18 + Vite'], ['Backend', 'Supabase'], ['State', 'Zustand'],
                  ['Styling', 'Tailwind CSS v3'], ['Charts', 'Recharts'], ['PWA', 'vite-plugin-pwa']].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-text-secondary font-semibold mb-0.5">{k}</p>
                      <p className="text-text-muted">{v}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
)
