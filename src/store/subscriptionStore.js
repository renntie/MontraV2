import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscriptionService } from '@/services/subscriptionService'

export const useSubscriptionStore = create(
  devtools(
    (set, get) => ({
      subscriptions: [],
      loading:       false,
      error:         null,

      fetchSubscriptions: async (userId) => {
        set({ loading: true, error: null })
        try {
          const data = await subscriptionService.getAll(userId)
          set({ subscriptions: data, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      addSubscription: async (payload) => {
        const data = await subscriptionService.create(payload)
        set((s) => ({ subscriptions: [...s.subscriptions, data] }))
        return data
      },

      updateSubscription: async (id, payload) => {
        const data = await subscriptionService.update(id, payload)
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) => (sub.id === id ? data : sub)),
        }))
        return data
      },

      deleteSubscription: async (id) => {
        await subscriptionService.delete(id)
        set((s) => ({ subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }))
      },

      paySubscription: async (userId, subscription) => {
        const updated = await subscriptionService.payNow(userId, subscription)
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? updated : sub)),
        }))
        return updated
      },

      // Ringkasan total tagihan bulanan aktif
      getMonthlyTotal: () => {
        return get().subscriptions
          .filter((s) => s.is_active)
          .reduce((sum, s) => {
            if (s.frequency === 'daily')   return sum + s.amount * 30
            if (s.frequency === 'weekly')  return sum + s.amount * 4
            if (s.frequency === 'monthly') return sum + s.amount
            if (s.frequency === 'yearly')  return sum + s.amount / 12
            return sum
          }, 0)
      },
    }),
    { name: 'SubscriptionStore' }
  )
)
