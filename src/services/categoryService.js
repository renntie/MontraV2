import { supabase } from '@/lib/supabase'

export const categoryService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or('user_id.eq.' + userId + ',is_default.eq.true')
      .order('is_default', { ascending: false })
      .order('name')
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase.from('categories').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}
