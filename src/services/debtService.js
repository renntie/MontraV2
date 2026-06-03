import { supabase } from '@/lib/supabase'

export const debtService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('status')                       // unpaid first
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('debts')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { id: _id, created_at, user_id, ...rest } = payload
    const { data, error } = await supabase
      .from('debts')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
