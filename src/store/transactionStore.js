import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { transactionService } from '@/services/transactionService'
import { format } from 'date-fns'

export const useTransactionStore = create(
  devtools(
    (set, get) => ({
      transactions: [],
      summary: { income: 0, expense: 0, balance: 0 },
      monthlyComparison: [],
      categoryBreakdown: [],
      loading: false,
      error: null,
      selectedMonth: format(new Date(), 'yyyy-MM-01'),
      filters: { type: null, categoryId: null, search: '' },

      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      clearFilters: () => set({ filters: { type: null, categoryId: null, search: '' } }),

      fetchTransactions: async (userId) => {
        set({ loading: true, error: null })
        try {
          const { selectedMonth, filters } = get()
          const data = await transactionService.getAll(userId, {
            month: selectedMonth,
            ...filters,
          })
          set({ transactions: data, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      fetchSummary: async (userId) => {
        try {
          const summary = await transactionService.getSummary(userId, get().selectedMonth)
          set({ summary })
        } catch (err) {
          console.error('fetchSummary error:', err)
        }
      },

      fetchMonthlyComparison: async (userId) => {
        try {
          const data = await transactionService.getMonthlyComparison(userId)
          set({ monthlyComparison: data })
        } catch (err) {
          console.error('fetchMonthlyComparison error:', err)
        }
      },

      fetchCategoryBreakdown: async (userId) => {
        try {
          const data = await transactionService.getCategoryBreakdown(userId, get().selectedMonth)
          set({ categoryBreakdown: data })
        } catch (err) {
          console.error('fetchCategoryBreakdown error:', err)
        }
      },

      addTransaction: async (payload) => {
        const data = await transactionService.create(payload)
        set((s) => ({ transactions: [data, ...s.transactions] }))
        return data
      },

      updateTransaction: async (id, payload) => {
        const data = await transactionService.update(id, payload)
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? data : t)),
        }))
        return data
      },

      deleteTransaction: async (id) => {
        await transactionService.delete(id)
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
      },

      refreshAll: async (userId) => {
        const store = get()
        await Promise.all([
          store.fetchTransactions(userId),
          store.fetchSummary(userId),
          store.fetchCategoryBreakdown(userId),
        ])
      },
    }),
    { name: 'TransactionStore' }
  )
)
