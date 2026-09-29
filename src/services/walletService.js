import { supabase } from '@/lib/supabase'

export const walletService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('wallets')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { id: _id, created_at, user_id, ...rest } = payload
    const { data, error } = await supabase
      .from('wallets')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) throw error
  },

  // Hitung saldo aktual: saldo awal + income - expense + transfer masuk - transfer keluar
  async getBalance(walletId) {
    const [txRes, trFromRes, trToRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('type, amount')
        .eq('wallet_id', walletId),
      supabase
        .from('transfers')
        .select('amount')
        .eq('from_wallet_id', walletId),
      supabase
        .from('transfers')
        .select('amount')
        .eq('to_wallet_id', walletId),
    ])
    if (txRes.error)     throw txRes.error
    if (trFromRes.error) throw trFromRes.error
    if (trToRes.error)   throw trToRes.error

    const txNet = (txRes.data || []).reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)
    const transferOut = (trFromRes.data || []).reduce((s, t) => s + t.amount, 0)
    const transferIn  = (trToRes.data  || []).reduce((s, t) => s + t.amount, 0)

    return txNet + transferIn - transferOut
  },
}
