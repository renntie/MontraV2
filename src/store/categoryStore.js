import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { categoryService } from '@/services/categoryService'

export const useCategoryStore = create(
  devtools(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async (userId) => {
        set({ loading: true, error: null })
        try {
          const data = await categoryService.getAll(userId)
          set({ categories: data, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      addCategory: async (payload) => {
        const data = await categoryService.create(payload)
        set((s) => ({ categories: [...s.categories, data] }))
        return data
      },

      updateCategory: async (id, payload) => {
        const data = await categoryService.update(id, payload)
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? data : c)) }))
        return data
      },

      deleteCategory: async (id) => {
        await categoryService.delete(id)
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type || c.type === 'both')
      },
    }),
    { name: 'CategoryStore' }
  )
)
