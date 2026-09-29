import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export const transferService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('transfers')
      .select('*, from_wallet:wallets!from_wallet_id(id,name,icon,color,type), to_wallet:wallets!to_wallet_id(id,name,icon,color,type)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('transfers')
      .insert(payload)
      .select('*, from_wallet:wallets!from_wallet_id(id,name,icon,color,type), to_wallet:wallets!to_wallet_id(id,name,icon,color,type)')
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { id: _id, created_at, user_id, from_wallet, to_wallet, ...rest } = payload
    const { data, error } = await supabase
      .from('transfers')
      .update(rest)
      .eq('id', id)
      .select('*, from_wallet:wallets!from_wallet_id(id,name,icon,color,type), to_wallet:wallets!to_wallet_id(id,name,icon,color,type)')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transfers').delete().eq('id', id)
    if (error) throw error
  },
}
