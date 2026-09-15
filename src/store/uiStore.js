import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useUIStore = create(
  devtools(
    (set) => ({
      // Active route — 5 halaman
      activeRoute: 'dashboard',

      // Transaction modal
      isTransactionModalOpen: false,
      editingTransaction: null,

      // Category modal
      isCategoryModalOpen: false,
      editingCategory: null,

      // Budget modal
      isBudgetModalOpen: false,
      editingBudget: null,

      // Savings modal
      isSavingsModalOpen: false,
      editingSaving: null,

      // Debt modal
      isDebtModalOpen: false,
      editingDebt: null,

      // Toast notifications
      toasts: [],

      // Routing
      setActiveRoute: (route) => set({ activeRoute: route }),

      // Transaction modal actions
      openTransactionModal: (tx = null) =>
        set({ isTransactionModalOpen: true, editingTransaction: tx }),
      closeTransactionModal: () =>
        set({ isTransactionModalOpen: false, editingTransaction: null }),

      // Category modal actions
      openCategoryModal: (cat = null) =>
        set({ isCategoryModalOpen: true, editingCategory: cat }),
      closeCategoryModal: () =>
        set({ isCategoryModalOpen: false, editingCategory: null }),

      // Budget modal actions
      openBudgetModal: (b = null) =>
        set({ isBudgetModalOpen: true, editingBudget: b }),
      closeBudgetModal: () =>
        set({ isBudgetModalOpen: false, editingBudget: null }),

      // Savings modal actions
      openSavingsModal: (s = null) =>
        set({ isSavingsModalOpen: true, editingSaving: s }),
      closeSavingsModal: () =>
        set({ isSavingsModalOpen: false, editingSaving: null }),

      // Debt modal actions
      openDebtModal: (d = null) =>
        set({ isDebtModalOpen: true, editingDebt: d }),
      closeDebtModal: () =>
        set({ isDebtModalOpen: false, editingDebt: null }),

      // Toast actions
      addToast: (message, type = 'success') => {
        const id = Date.now() + Math.random()
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
        }, 3500)
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'UIStore' }
  )
)
