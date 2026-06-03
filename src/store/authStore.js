import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '@/services/authService'

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        session: null,
        loading: true,
        error: null,

        setUser: (user) => set({ user }),
        setSession: (session) => set({ session, user: session?.user ?? null }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        signInWithEmail: async (email, password) => {
          set({ loading: true, error: null })
          try {
            const data = await authService.signInWithEmail(email, password)
            set({ session: data.session, user: data.user, loading: false })
          } catch (err) {
            set({ error: err.message, loading: false })
            throw err
          }
        },

        signUpWithEmail: async (email, password, fullName) => {
          set({ loading: true, error: null })
          try {
            const data = await authService.signUpWithEmail(email, password, fullName)
            set({ loading: false })
            return data
          } catch (err) {
            set({ error: err.message, loading: false })
            throw err
          }
        },

        signInWithGoogle: async () => {
          set({ loading: true, error: null })
          try {
            await authService.signInWithGoogle()
          } catch (err) {
            set({ error: err.message, loading: false })
            throw err
          }
        },

        signOut: async () => {
          set({ loading: true })
          await authService.signOut()
          set({ user: null, session: null, loading: false })
        },

        initialize: async () => {
          set({ loading: true })
          const session = await authService.getSession()
          set({ session, user: session?.user ?? null, loading: false })

          authService.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null, loading: false })
          })
        },
      }),
      { name: 'montra-auth', partialize: (s) => ({ user: s.user }) }
    ),
    { name: 'AuthStore' }
  )
)
