import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export const BottomSheet = ({ isOpen, onClose, title, children, className = '' }) => {
  const overlayRef = useRef(null)

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={`
        relative bg-bg-surface border border-border shadow-float
        rounded-t-[2rem] lg:rounded-3xl
        w-full lg:max-w-md max-h-[92vh] overflow-hidden flex flex-col
        animate-slide-up
        ${className}
      `}>
        {/* Pull handle (mobile only) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-bg-overlay" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-bg-elevated flex items-center justify-center
              text-text-muted hover:text-text-primary hover:bg-bg-overlay
              transition-all duration-150 hover:scale-110 active:scale-95"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  )
}
