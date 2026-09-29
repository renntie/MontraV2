import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { walletService } from '@/services/walletService'

export const useWalletStore = create(
  devtools(
    (set, get) => ({
      wallets:  [],
      balances: {}, // { walletId: number }
      loading:  false,
      error:    null,

      fetchWallets: async (userId) => {
        set({ loading: true, error: null })
        try {
          const data = await walletService.getAll(userId)
          set({ wallets: data, loading: false })
          // Fetch balances for all wallets
          get().fetchAllBalances(data)
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      fetchAllBalances: async (wallets) => {
        try {
          const entries = await Promise.all(
            wallets.map(async (w) => {
              const net = await walletService.getBalance(w.id)
              return [w.id, w.initial_balance + net]
            })
          )
          set({ balances: Object.fromEntries(entries) })
        } catch (err) {
          console.error('fetchAllBalances error:', err)
        }
      },

      getTotalBalance: () => {
        return Object.values(get().balances).reduce((s, b) => s + b, 0)
      },

      addWallet: async (payload) => {
        const data = await walletService.create(payload)
        set((s) => ({ wallets: [...s.wallets, data] }))
        // init balance = initial_balance (no tx yet)
        set((s) => ({ balances: { ...s.balances, [data.id]: data.initial_balance } }))
        return data
      },

      updateWallet: async (id, payload) => {
        const data = await walletService.update(id, payload)
        set((s) => ({ wallets: s.wallets.map((w) => (w.id === id ? data : w)) }))
        return data
      },

      deleteWallet: async (id) => {
        await walletService.delete(id)
        set((s) => ({
          wallets:  s.wallets.filter((w) => w.id !== id),
          balances: Object.fromEntries(
            Object.entries(s.balances).filter(([k]) => k !== id)
          ),
        }))
      },

      // Refresh saldo satu dompet setelah transaksi/transfer
      refreshBalance: async (walletId) => {
        try {
          const wallet = get().wallets.find((w) => w.id === walletId)
          if (!wallet) return
          const net = await walletService.getBalance(walletId)
          set((s) => ({ balances: { ...s.balances, [walletId]: wallet.initial_balance + net } }))
        } catch (err) {
          console.error('refreshBalance error:', err)
        }
      },
    }),
    { name: 'WalletStore' }
  )
)
