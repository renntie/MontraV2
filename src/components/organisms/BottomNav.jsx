import { useState } from 'react'
import { LayoutDashboard, ArrowLeftRight, BarChart3, BookMarked, Settings, Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const NAV_ITEMS = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Beranda' },
  { id: 'transactions', icon: ArrowLeftRight,  label: 'Transaksi' },
  { id: 'analytics',   icon: BarChart3,        label: 'Analitik' },
  { id: 'goals',       icon: BookMarked,       label: 'Tujuan' },
  { id: 'settings',    icon: Settings,         label: 'Pengaturan' },
]

export const BottomNav = () => {
  const {
    activeRoute, setActiveRoute, openTransactionModal,
    isTransactionModalOpen, isCategoryModalOpen, isBudgetModalOpen, isSavingsModalOpen, isDebtModalOpen,
  } = useUIStore()

  const isModalOpen = Boolean(
    isTransactionModalOpen || isCategoryModalOpen || isBudgetModalOpen || isSavingsModalOpen || isDebtModalOpen
  )

  if (isModalOpen) return null

  const leftItems  = NAV_ITEMS.slice(0, 2)
  const rightItems = NAV_ITEMS.slice(2)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom">
      <div className="glass border-t border-border px-1 pt-2 pb-1">
        <div className="flex items-center justify-around relative">
          {leftItems.map((item) => (
            <NavBtn
              key={item.id}
              {...item}
              isActive={activeRoute === item.id}
              onClick={() => setActiveRoute(item.id)}
            />
          ))}

          {/* FAB */}
          <FABButton onClick={openTransactionModal} />

          {rightItems.map((item) => (
            <NavBtn
              key={item.id}
              {...item}
              isActive={activeRoute === item.id}
              onClick={() => setActiveRoute(item.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}

const FABButton = ({ onClick }) => {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={() => { onClick(); setPressed(true); setTimeout(() => setPressed(false), 300) }}
      className={`
        relative -top-5 w-14 h-14 rounded-full bg-accent-income
        flex items-center justify-center flex-shrink-0
        shadow-glow-income transition-all duration-200
        hover:brightness-110 hover:shadow-glow-income
        ${pressed ? 'scale-90' : 'scale-100'}
        active:scale-90
      `}
    >
      {/* Ripple ring */}
      <div className={`absolute inset-0 rounded-full border-2 border-accent-income/40
        transition-all duration-300 ${pressed ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
      <Plus
        size={26}
        className={`text-bg transition-transform duration-300 ${pressed ? 'rotate-45' : 'rotate-0'}`}
        strokeWidth={2.5}
      />
    </button>
  )
}

const NavBtn = ({ id, icon: Icon, label, isActive, onClick }) => {
  const [tapped, setTapped] = useState(false)

  const handleClick = () => {
    setTapped(true)
    setTimeout(() => setTapped(false), 300)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-0.5 px-2.5 py-1 min-w-[52px] relative group"
    >
      {/* Active pill bg */}
      <div className={`
        absolute top-0.5 left-1/2 -translate-x-1/2 h-8 w-10 rounded-2xl
        transition-all duration-300 ease-smooth
        ${isActive ? 'bg-accent-income/12 scale-100' : 'bg-transparent scale-75'}
      `} />

      <Icon
        size={22}
        className={`
          relative z-10 transition-all duration-250
          ${isActive ? 'text-accent-income' : 'text-text-muted'}
          ${tapped ? 'scale-125' : isActive ? 'scale-100' : 'group-hover:scale-110 group-hover:text-text-secondary'}
        `}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      <span className={`
        text-[10px] font-medium relative z-10 transition-all duration-250
        ${isActive ? 'text-accent-income' : 'text-text-muted'}
      `}>
        {label}
      </span>
    </button>
  )
}
