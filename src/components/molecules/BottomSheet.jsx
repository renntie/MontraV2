import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export const BottomSheet = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className={`
        relative bg-bg-surface border border-border shadow-float
        rounded-t-[2rem] sm:rounded-3xl
        w-full sm:max-w-lg
        max-h-[90dvh] sm:max-h-[85vh]
        flex flex-col
        animate-slide-up sm:animate-scale-in
        z-10 overflow-hidden safe-bottom
        ${className}
      `}>
        {/* Pull handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-bg-overlay" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0 bg-bg-surface">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-bg-elevated flex items-center justify-center
              text-text-muted hover:text-text-primary hover:bg-bg-overlay
              transition-all duration-150 hover:scale-110 active:scale-95"
            aria-label="Tutup"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}



