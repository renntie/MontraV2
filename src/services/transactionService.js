import { supabase } from '@/lib/supabase'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export const transactionService = {
  async getAll(userId, filters = {}) {
    let query = supabase
      .from('transactions')
      .select('*, categories(id, name, icon, color, type)')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (filters.month) {
      const date = new Date(filters.month)
      query = query
        .gte('date', format(startOfMonth(date), 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth(date), 'yyyy-MM-dd'))
    }
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters.search) query = query.ilike('note', '%' + filters.search + '%')

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select('*, categories(id, name, icon, color, type)')
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select('*, categories(id, name, icon, color, type)')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  },

  async getSummary(userId, month) {
    const date = new Date(month)
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', format(startOfMonth(date), 'yyyy-MM-dd'))
      .lte('date', format(endOfMonth(date), 'yyyy-MM-dd'))
    if (error) throw error

    const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, balance: income - expense }
  },

  async getMonthlyComparison(userId, months = 6) {
    const results = []
    const now = new Date()
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const summary = await transactionService.getSummary(userId, date)
      results.push({ month: format(date, 'MMM yyyy'), ...summary })
    }
    return results
  },

  async getCategoryBreakdown(userId, month) {
    const date = new Date(month)
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, category_id, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', format(startOfMonth(date), 'yyyy-MM-dd'))
      .lte('date', format(endOfMonth(date), 'yyyy-MM-dd'))
    if (error) throw error

    const map = {}
    data.forEach(tx => {
      const key = tx.category_id || 'uncategorized'
      if (!map[key]) map[key] = { ...tx.categories, amount: 0 }
      map[key].amount += tx.amount
    })
    return Object.values(map).sort((a, b) => b.amount - a.amount)
  },

  subscribeToChanges(userId, callback) {
    return supabase
      .channel('transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: 'user_id=eq.' + userId,
      }, callback)
      .subscribe()
  },
}
