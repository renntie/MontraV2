import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export const budgetService = {
  async getByMonth(userId, month) {
    const monthStr = format(new Date(month), 'yyyy-MM')
    const { data, error } = await supabase
      .from('budgets')
      .select('*, categories(id, name, icon, color)')
      .eq('user_id', userId)
      .eq('month', monthStr)
    if (error) throw error
    return data
  },

  async upsert(payload) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(payload, { onConflict: 'user_id,category_id,month' })
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
  },
}
