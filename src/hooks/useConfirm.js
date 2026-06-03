import { useState, useCallback } from 'react'

/**
 * useConfirm — replaces window.confirm with a programmatic hook
 * Returns { confirm, ConfirmDialog }
 * 
 * Usage:
 *   const { confirm } = useConfirm()
 *   const ok = await confirm('Hapus item ini?')
 *   if (ok) await deleteItem()
 */
export const useConfirm = () => {
  const [state, setState] = useState({ open: false, message: '', resolve: null })

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, message, resolve })
    })
  }, [])

  const handleResponse = (answer) => {
    state.resolve?.(answer)
    setState({ open: false, message: '', resolve: null })
  }

  const ConfirmDialog = state.open ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleResponse(false)} />
      <div className="relative bg-bg-surface border border-border rounded-3xl p-6 w-full max-w-xs shadow-float animate-scale-in">
        <p className="text-sm font-medium text-text-primary text-center mb-6 leading-relaxed">
          {state.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 py-2.5 rounded-2xl border border-border text-sm font-semibold text-text-secondary hover:bg-bg-elevated transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 py-2.5 rounded-2xl bg-accent-expense text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, ConfirmDialog }
}
