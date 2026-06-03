import { useEffect, useRef } from 'react'
import { transactionService } from '@/services/transactionService'
import { useTransactionStore } from '@/store/transactionStore'
import { useAuthStore } from '@/store/authStore'

/**
 * Subscribe to Supabase realtime for the current user's transactions.
 * Auto-cleans up on unmount or user change.
 */
export const useRealtime = () => {
  const { user }       = useAuthStore()
  const { refreshAll } = useTransactionStore()
  const channelRef     = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    channelRef.current = transactionService.subscribeToChanges(user.id, () => {
      refreshAll(user.id)
    })

    return () => {
      channelRef.current?.unsubscribe()
      channelRef.current = null
    }
  }, [user?.id])
}
