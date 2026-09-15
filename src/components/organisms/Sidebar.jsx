import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, Settings,
  LogOut, Plus, Download, ChevronRight, Heart,
} from 'lucide-react'
import { MontraLogo } from '@/components/atoms/MontraLogo'
import { Avatar } from '@/components/atoms/Avatar'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useInstallPWA } from '@/hooks/useInstallPWA'

const NAV_ITEMS = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'transactions', icon: ArrowLeftRight,  label: 'Transaksi' },
  { id: 'analytics',   icon: BarChart3,        label: 'Analitik' },
  { id: 'goals',       icon: Target,           label: 'Tujuan & Hutang' },
  { id: 'settings',    icon: Settings,         label: 'Pengaturan' },
]

const SOCIABUZZ_URL = 'https://sociabuzz.com/lilramm'

export const Sidebar = () => {
  const { activeRoute, setActiveRoute, openTransactionModal } = useUIStore()
  const { user, signOut } = useAuthStore()
  const { canInstall, install, installed } = useInstallPWA()
  const [installing, setInstalling] = useState(false)

  const name  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''

  const handleInstall = async () => {
    if (!canInstall) return
    setInstalling(true)
    await install()
    setInstalling(false)
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-bg-surface border-r border-border h-screen sticky top-0 flex-shrink-0 overflow-hidden">

      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <MontraLogo size="md" />
      </div>

      {/* Add Transaction CTA */}
      <div className="px-4 mb-3 flex-shrink-0">
        <button
          onClick={openTransactionModal}
          className="w-full flex items-center justify-center gap-2 h-10 bg-accent-income rounded-2xl
            text-bg text-sm font-bold hover:brightness-110 active:scale-[0.98]
            transition-all duration-200 shadow-glow-income/30 group"
        >
          <Plus size={16} strokeWidth={2.8}
            className="transition-transform duration-300 group-hover:rotate-90" />
          Tambah Transaksi
        </button>
      </div>

      {/* PWA Install Banner */}
      {(canInstall || !installed) && (
        <div className="mx-4 mb-3 flex-shrink-0">
          <button
            onClick={canInstall ? handleInstall : undefined}
            disabled={installing || installed}
            className={`
              w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border
              transition-all duration-300 group text-left
              ${installed
                ? 'border-accent-income/20 bg-accent-income/5 cursor-default'
                : 'border-accent-blue/30 bg-accent-blue/5 hover:bg-accent-blue/10 hover:border-accent-blue/50 active:scale-[0.98]'}
            `}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              transition-transform duration-200 ${!installed ? 'group-hover:scale-110' : ''}
              ${installed ? 'bg-accent-income/20' : 'bg-accent-blue/20'}`}>
              <Download size={15} className={installed ? 'text-accent-income' : 'text-accent-blue'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold leading-tight ${installed ? 'text-accent-income' : 'text-accent-blue'}`}>
                {installed ? 'Sudah Terinstall' : installing ? 'Menginstall...' : 'Install Montra'}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {installed ? 'Berjalan sebagai app' : 'Tambah ke layar utama'}
              </p>
            </div>
            {!installed && canInstall && (
              <ChevronRight size={13} className="text-accent-blue/60 flex-shrink-0
                transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide min-h-0">
        {NAV_ITEMS.map(({ id, icon: Icon, label }, idx) => {
          const isActive = activeRoute === id
          return (
            <button
              key={id}
              onClick={() => setActiveRoute(id)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium
                transition-all duration-200 group relative overflow-hidden
                animate-slide-right
                ${isActive
                  ? 'bg-accent-income/10 text-accent-income'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-accent-income/5 to-transparent pointer-events-none" />
              )}
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`flex-shrink-0 transition-all duration-200
                  ${!isActive ? 'group-hover:scale-110 group-hover:-rotate-3' : ''}`}
              />
              <span className="relative">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-income animate-pulse-soft" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Support Sociabuzz */}
      <div className="px-4 pt-3 flex-shrink-0">
        <a
          href={SOCIABUZZ_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl
            bg-gradient-to-r from-accent-sociabuzz/10 to-accent-purple/10
            border border-accent-sociabuzz/20 hover:border-accent-sociabuzz/40
            hover:from-accent-sociabuzz/15 hover:to-accent-purple/15
            transition-all duration-300 group hover:shadow-glow-sociabuzz/20
            hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
        >
          <div className="w-7 h-7 rounded-xl sociabuzz-gradient flex items-center justify-center
            flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Heart size={13} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold gradient-text-sociabuzz leading-tight">Support Developer</p>
            <p className="text-[10px] text-text-muted mt-0.5">Sociabuzz - Traktir kopi</p>
          </div>
          <ChevronRight size={12}
            className="text-accent-sociabuzz/50 flex-shrink-0
              transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* User footer */}
      <div className="px-4 pb-5 pt-3 border-t border-border flex-shrink-0 mt-1">
        <div className="flex items-center gap-3 mb-2.5">
          <Avatar name={name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
            <p className="text-xs text-text-muted truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm
            text-text-muted hover:text-accent-expense hover:bg-accent-expense/5
            transition-all duration-200 group"
        >
          <LogOut size={15}
            className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
