import { useState } from 'react'
import {
  LogOut, Plus, Pencil, Trash2, Download, Shield, Bell,
  ChevronRight, Heart, ExternalLink, Smartphone, Sparkles,
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

export const SettingsPage = () => {
  const { user, signOut }              = useAuthStore()
  const { categories, deleteCategory } = useCategoryStore()
  const { addToast, openCategoryModal } = useUIStore()
  const { canInstall, install, installed } = useInstallPWA()

  const [tab,        setTab]        = useState('account')
  const [installing, setInstalling] = useState(false)

  const name        = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna'
  const email       = user?.email || ''
  const defaultCats = categories.filter((c) =>  c.is_default)
  const customCats  = categories.filter((c) => !c.is_default)

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
    if (!canInstall) return
    setInstalling(true)
    const accepted = await install()
    setInstalling(false)
    if (accepted) addToast('Montra berhasil diinstall! 🎉')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <h1 className="text-xl font-extrabold text-text-primary mb-4">Pengaturan</h1>
        <div className="flex gap-1 p-1 bg-bg-elevated rounded-2xl">
          {[['account','Akun'],['categories','Kategori'],['app','Aplikasi']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ${
                tab === val
                  ? 'bg-bg-surface text-text-primary shadow-card scale-[1.02]'
                  : 'text-text-muted'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 scrollbar-hide">
        <div key={tab} className="page-enter space-y-4">

          {/* ── ACCOUNT ─────────────────────────── */}
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
                  <button key={label}
                    className="w-full flex items-center justify-between px-4 py-3.5
                      hover:bg-bg-elevated transition-all duration-200 group">
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
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5
                    hover:bg-accent-expense/5 transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-accent-expense/10
                    flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <LogOut size={16} className="text-accent-expense" />
                  </div>
                  <span className="text-sm font-medium text-accent-expense">Keluar dari Akun</span>
                </button>
              </Card>
            </>
          )}

          {/* ── CATEGORIES ──────────────────────── */}
          {tab === 'categories' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Kustom ({customCats.length})</p>
                  <button onClick={() => openCategoryModal(null)}
                    className="flex items-center gap-1 text-xs font-bold text-accent-income hover:underline">
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                {customCats.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-text-muted mb-3">Belum ada kategori kustom</p>
                    <Button size="sm" variant="secondary" icon={Plus}
                      onClick={() => openCategoryModal(null)}>
                      Buat Kategori
                    </Button>
                  </Card>
                ) : (
                  <Card className="overflow-hidden divide-y divide-border">
                    {customCats.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-3 px-4 py-3 group
                        hover:bg-bg-elevated transition-colors duration-150">
                        <CategoryIcon iconName={cat.icon} color={cat.color} size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                          <p className="text-xs text-text-muted">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button onClick={() => openCategoryModal(cat)}
                            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-overlay
                              transition-all duration-150 hover:scale-110">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 rounded-xl text-text-muted hover:text-accent-expense hover:bg-accent-expense/10
                              transition-all duration-150 hover:scale-110">
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

          {/* ── APP ─────────────────────────────── */}
          {tab === 'app' && (
            <>
              {/* Install PWA Banner */}
              <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300
                ${installed
                  ? 'bg-accent-income/5 border-accent-income/20'
                  : 'bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/25'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent-blue/10
                  -translate-y-8 translate-x-8 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                      ${installed ? 'bg-accent-income/20' : 'bg-accent-blue/20'}`}>
                      {installed
                        ? <Smartphone size={22} className="text-accent-income" />
                        : <Download size={22} className="text-accent-blue animate-float" />}
                    </div>
                    <div>
                      <p className={`text-base font-extrabold ${installed ? 'text-accent-income' : 'text-text-primary'}`}>
                        {installed ? 'Montra Sudah Terinstall ✓' : 'Install Montra'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {installed ? 'Berjalan sebagai native app' : 'Tambah ke layar utama perangkat'}
                      </p>
                    </div>
                  </div>
                  {!installed && (
                    <ul className="space-y-1.5 mb-4 text-xs text-text-secondary">
                      {['Akses lebih cepat dari home screen','Bisa digunakan tanpa buka browser','Notifikasi & offline support'].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {canInstall && !installed && (
                    <Button onClick={handleInstall} loading={installing} icon={Download}
                      className="w-full bg-accent-blue text-white hover:brightness-110 font-bold">
                      {installing ? 'Menginstall...' : 'Install Sekarang'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Sociabuzz Support Banner */}
              <div className="relative overflow-hidden rounded-3xl p-5 border border-accent-sociabuzz/20
                bg-gradient-to-br from-accent-sociabuzz/8 to-accent-purple/8
                hover:border-accent-sociabuzz/35 hover:from-accent-sociabuzz/12 hover:to-accent-purple/12
                transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-sociabuzz/15 group">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-accent-sociabuzz/10
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
                      <p className="text-xs text-text-muted">Bantu kami terus berkembang 🚀</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    Montra dibuat dengan ❤️ sebagai aplikasi gratis. Jika kamu merasa terbantu,
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

              {/* App Info */}
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <MontraLogo size="md" showText={false} />
                  <div>
                    <p className="text-base font-extrabold text-text-primary flex items-center gap-1.5">
                      Montra <Sparkles size={13} className="text-accent-yellow" />
                    </p>
                    <p className="text-xs text-text-muted">Personal Finance · v1.0.0</p>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  Aplikasi manajemen keuangan pribadi yang simpel, cepat, dan elegan.
                  Data tersimpan aman di cloud Supabase.
                </p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-border pt-4">
                  {[['Frontend','React 18 + Vite'],['Backend','Supabase'],['State','Zustand'],
                    ['Styling','Tailwind CSS v3'],['Charts','Recharts'],['PWA','vite-plugin-pwa']].map(([k,v]) => (
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
