import { supabase } from '@/lib/supabase'
import { addDays, addWeeks, addMonths, addYears, format, parseISO, isPast, isToday } from 'date-fns'

export const subscriptionService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, categories(id, name, icon, color), wallets(id, name, icon, color)')
      .eq('user_id', userId)
      .order('next_due', { ascending: true })
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(payload)
      .select('*, categories(id, name, icon, color), wallets(id, name, icon, color)')
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { id: _id, created_at, user_id, categories, wallets, ...rest } = payload
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, categories(id, name, icon, color), wallets(id, name, icon, color)')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (error) throw error
  },

  // Tandai lunas: buat transaksi + geser next_due ke periode berikutnya
  async payNow(userId, subscription) {
    const { id, amount, category_id, wallet_id, frequency, next_due } = subscription

    // 1. Buat transaksi expense
    const txPayload = {
      user_id:     userId,
      type:        'expense',
      amount,
      category_id: category_id || null,
      wallet_id:   wallet_id   || null,
      note:        subscription.name,
      date:        format(new Date(), 'yyyy-MM-dd'),
    }
    const { error: txErr } = await supabase.from('transactions').insert(txPayload)
    if (txErr) throw txErr

    // 2. Geser next_due ke periode berikutnya
    const currentDue = parseISO(next_due)
    let newDue
    if (frequency === 'daily')   newDue = addDays(currentDue, 1)
    if (frequency === 'weekly')  newDue = addWeeks(currentDue, 1)
    if (frequency === 'monthly') newDue = addMonths(currentDue, 1)
    if (frequency === 'yearly')  newDue = addYears(currentDue, 1)

    const { data, error: subErr } = await supabase
      .from('subscriptions')
      .update({ next_due: format(newDue, 'yyyy-MM-dd'), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, categories(id, name, icon, color), wallets(id, name, icon, color)')
      .single()
    if (subErr) throw subErr
    return data
  },

  // Helper: status jatuh tempo
  getDueStatus(nextDue) {
    const due = parseISO(nextDue)
    if (isPast(due) && !isToday(due)) return 'overdue'
    if (isToday(due)) return 'today'
    return 'upcoming'
  },
}
