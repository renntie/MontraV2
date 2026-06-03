import { useEffect } from 'react'
import { Sidebar }            from '@/components/organisms/Sidebar'
import { BottomNav }          from '@/components/organisms/BottomNav'
import { BottomSheet }        from '@/components/molecules/BottomSheet'
import { TransactionForm }    from '@/components/organisms/TransactionForm'
import { CategoryForm }       from '@/components/organisms/CategoryForm'
import { ToastContainer }     from '@/components/molecules/Toast'
import { DashboardPage }      from '@/components/pages/DashboardPage'
import { TransactionsPage }   from '@/components/pages/TransactionsPage'
import { AnalyticsPage }      from '@/components/pages/AnalyticsPage'
import { GoalsPage }          from '@/components/pages/GoalsPage'
import { SettingsPage }       from '@/components/pages/SettingsPage'
import { useUIStore }         from '@/store/uiStore'
import { useAuthStore }       from '@/store/authStore'
import { useCategoryStore }   from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import { transactionService } from '@/services/transactionService'

const PAGES = {
  dashboard:    DashboardPage,
  transactions: TransactionsPage,
  analytics:    AnalyticsPage,
  goals:        GoalsPage,
  settings:     SettingsPage,
}

export const AppShell = () => {
  const { user }             = useAuthStore()
  const { fetchCategories }  = useCategoryStore()
  const { refreshAll }       = useTransactionStore()
  const {
    activeRoute,
    isTransactionModalOpen, editingTransaction, closeTransactionModal,
    isCategoryModalOpen,    editingCategory,    closeCategoryModal,
  } = useUIStore()

  useEffect(() => {
    if (!user?.id) return
    fetchCategories(user.id)
    refreshAll(user.id)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const channel = transactionService.subscribeToChanges(user.id, () => {
      refreshAll(user.id)
    })
    return () => { channel.unsubscribe() }
  }, [user?.id])

  const ActivePage = PAGES[activeRoute] ?? DashboardPage

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 overflow-hidden">
        {/* Page with enter animation keyed on activeRoute */}
        <div key={activeRoute} className="flex-1 h-full overflow-hidden page-enter">
          <ActivePage />
        </div>
      </main>

      <BottomNav />
      <ToastContainer />

      {/* Transaction Sheet */}
      <BottomSheet
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
      >
        <TransactionForm
          editingTransaction={editingTransaction}
          onClose={closeTransactionModal}
        />
      </BottomSheet>

      {/* Category Sheet */}
      <BottomSheet
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
      >
        <CategoryForm
          category={editingCategory}
          onClose={closeCategoryModal}
        />
      </BottomSheet>
    </div>
  )
}
