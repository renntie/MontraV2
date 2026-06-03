import { supabase } from '@/lib/supabase'

export const savingsService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    // Remove generated/readonly fields before update
    const { id: _id, created_at, ...rest } = payload
    const { data, error } = await supabase
      .from('savings_goals')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
