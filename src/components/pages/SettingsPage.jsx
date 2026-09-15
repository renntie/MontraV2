import { useState } from 'react'
import {
  LogOut, Plus, Pencil, Trash2, Download, Shield, Bell,
  ChevronRight, Heart, ExternalLink, Smartphone, Sparkles,
  ArrowLeft,
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
  const { addToast, openCategoryModal, setActiveRoute } = useUIStore()
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
    if (accepted) addToast('Montra berhasil diinstall!')
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

          {/* CATEGORIES */}
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
                            aria-label="Edit kategori"
                            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-overlay
                              transition-all duration-150 hover:scale-110">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)}
                            aria-label="Hapus kategori"
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
                        disabled={!canInstall}
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
