import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const CONFIGS = {
  success: {
    icon:   <CheckCircle2 size={15} className="text-accent-income flex-shrink-0" />,
    bar:    'bg-accent-income',
    border: 'border-accent-income/20',
  },
  error: {
    icon:   <AlertCircle  size={15} className="text-accent-expense flex-shrink-0" />,
    bar:    'bg-accent-expense',
    border: 'border-accent-expense/20',
  },
  info: {
    icon:   <Info         size={15} className="text-accent-blue flex-shrink-0" />,
    bar:    'bg-accent-blue',
    border: 'border-accent-blue/20',
  },
}

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false)
  const cfg = CONFIGS[toast.type] || CONFIGS.info

  useEffect(() => {
    // Trigger enter
    const t1 = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t1)
  }, [])

  const handleRemove = () => {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 250)
  }

  return (
    <div
      className={`
        relative flex items-center gap-3 px-4 py-3
        bg-bg-elevated border ${cfg.border} rounded-2xl shadow-float
        overflow-hidden pointer-events-auto
        transition-all duration-250
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'}
      `}
    >
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} rounded-full
        animate-[shrink_3.5s_linear_forwards]`}
        style={{ width: '100%' }}
      />

      {cfg.icon}
      <span className="text-sm text-text-primary flex-1 font-medium">{toast.message}</span>
      <button
        onClick={handleRemove}
        className="text-text-muted hover:text-text-primary transition-colors
          flex-shrink-0 hover:rotate-90 transition-transform duration-200"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100]
      flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
