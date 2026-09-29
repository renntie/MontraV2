import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useUIStore = create(
  devtools(
    (set) => ({
      // Active route
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

      // Wallet modal
      isWalletModalOpen: false,
      editingWallet: null,

      // Transfer modal
      isTransferModalOpen: false,
      editingTransfer: null,

      // Subscription modal
      isSubscriptionModalOpen: false,
      editingSubscription: null,

      // Split Bill modal
      isSplitBillModalOpen: false,

      // Privacy Mode (Sensor Saldo)
      isPrivacyMode: typeof window !== 'undefined' ? localStorage.getItem('montra_privacy_mode') === 'true' : false,
      togglePrivacyMode: () =>
        set((s) => {
          const next = !s.isPrivacyMode
          if (typeof window !== 'undefined') {
            localStorage.setItem('montra_privacy_mode', String(next))
          }
          return { isPrivacyMode: next }
        }),

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

      // Wallet modal actions
      openWalletModal: (w = null) =>
        set({ isWalletModalOpen: true, editingWallet: w }),
      closeWalletModal: () =>
        set({ isWalletModalOpen: false, editingWallet: null }),

      // Transfer modal actions
      openTransferModal: (t = null) =>
        set({ isTransferModalOpen: true, editingTransfer: t }),
      closeTransferModal: () =>
        set({ isTransferModalOpen: false, editingTransfer: null }),

      // Subscription modal actions
      openSubscriptionModal: (sub = null) =>
        set({ isSubscriptionModalOpen: true, editingSubscription: sub }),
      closeSubscriptionModal: () =>
        set({ isSubscriptionModalOpen: false, editingSubscription: null }),

      // Split Bill modal actions
      openSplitBillModal: () => set({ isSplitBillModalOpen: true }),
      closeSplitBillModal: () => set({ isSplitBillModalOpen: false }),

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
