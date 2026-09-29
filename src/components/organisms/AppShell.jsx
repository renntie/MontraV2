import { useEffect } from 'react'
import { Sidebar }            from '@/components/organisms/Sidebar'
import { BottomNav }          from '@/components/organisms/BottomNav'
import { BottomSheet }        from '@/components/molecules/BottomSheet'
import { TransactionForm }    from '@/components/organisms/TransactionForm'
import { CategoryForm }       from '@/components/organisms/CategoryForm'
import { BudgetForm }         from '@/components/organisms/BudgetForm'
import { SavingsForm }        from '@/components/organisms/SavingsForm'
import { DebtForm }           from '@/components/organisms/DebtForm'
import { WalletForm }         from '@/components/organisms/WalletForm'
import { TransferForm }       from '@/components/organisms/TransferForm'
import { SubscriptionForm }   from '@/components/organisms/SubscriptionForm'
import { SplitBillForm }      from '@/components/organisms/SplitBillForm'
import { ToastContainer }     from '@/components/molecules/Toast'
import { DashboardPage }      from '@/components/pages/DashboardPage'
import { TransactionsPage }   from '@/components/pages/TransactionsPage'
import { AnalyticsPage }      from '@/components/pages/AnalyticsPage'
import { GoalsPage }          from '@/components/pages/GoalsPage'
import { WalletsPage }        from '@/components/pages/WalletsPage'
import { SettingsPage }       from '@/components/pages/SettingsPage'
import { useUIStore }         from '@/store/uiStore'
import { useAuthStore }       from '@/store/authStore'
import { useCategoryStore }   from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useWalletStore }     from '@/store/walletStore'
import { transactionService } from '@/services/transactionService'

const PAGES = {
  dashboard:    DashboardPage,
  transactions: TransactionsPage,
  analytics:    AnalyticsPage,
  goals:        GoalsPage,
  wallets:      WalletsPage,
  settings:     SettingsPage,
}

export const AppShell = () => {
  const { user }             = useAuthStore()
  const { fetchCategories }  = useCategoryStore()
  const { refreshAll, selectedMonth } = useTransactionStore()
  const { fetchWallets }     = useWalletStore()
  const {
    activeRoute,
    isTransactionModalOpen,  editingTransaction,  closeTransactionModal,
    isCategoryModalOpen,     editingCategory,     closeCategoryModal,
    isBudgetModalOpen,       editingBudget,       closeBudgetModal,
    isSavingsModalOpen,      editingSaving,       closeSavingsModal,
    isDebtModalOpen,         editingDebt,         closeDebtModal,
    isWalletModalOpen,       editingWallet,       closeWalletModal,
    isTransferModalOpen,     editingTransfer,     closeTransferModal,
    isSubscriptionModalOpen, editingSubscription, closeSubscriptionModal,
    isSplitBillModalOpen,                         closeSplitBillModal,
  } = useUIStore()

  useEffect(() => {
    if (!user?.id) return
    fetchCategories(user.id)
    refreshAll(user.id)
    fetchWallets(user.id)
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
    <div className="h-[100dvh] bg-bg flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-0">
        <div key={activeRoute} className="flex-1 min-h-0 page-enter">
          <ActivePage />
        </div>
      </main>

      <BottomNav />
      <ToastContainer />

      {/* Transaction Sheet */}
      <BottomSheet isOpen={isTransactionModalOpen} onClose={closeTransactionModal}
        title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}>
        <TransactionForm editingTransaction={editingTransaction} onClose={closeTransactionModal} />
      </BottomSheet>

      {/* Category Sheet */}
      <BottomSheet isOpen={isCategoryModalOpen} onClose={closeCategoryModal}
        title={editingCategory ? 'Edit Kategori' : 'Kategori Baru'}>
        <CategoryForm category={editingCategory} onClose={closeCategoryModal} />
      </BottomSheet>

      {/* Budget Sheet */}
      <BottomSheet isOpen={isBudgetModalOpen} onClose={closeBudgetModal}
        title={editingBudget ? 'Edit Anggaran' : 'Buat Anggaran Baru'}>
        <BudgetForm budget={editingBudget} selectedMonth={selectedMonth}
          onClose={closeBudgetModal} onSaved={() => refreshAll(user?.id)} />
      </BottomSheet>

      {/* Savings Sheet */}
      <BottomSheet isOpen={isSavingsModalOpen} onClose={closeSavingsModal}
        title={editingSaving ? 'Edit Target Tabungan' : 'Target Tabungan Baru'}>
        <SavingsForm saving={editingSaving} onClose={closeSavingsModal}
          onSaved={() => refreshAll(user?.id)} />
      </BottomSheet>

      {/* Debt Sheet */}
      <BottomSheet isOpen={isDebtModalOpen} onClose={closeDebtModal}
        title={editingDebt ? 'Edit Catatan Hutang' : 'Catat Hutang / Piutang'}>
        <DebtForm debt={editingDebt} onClose={closeDebtModal}
          onSaved={() => refreshAll(user?.id)} />
      </BottomSheet>

      {/* Wallet Sheet */}
      <BottomSheet isOpen={isWalletModalOpen} onClose={closeWalletModal}
        title={editingWallet ? 'Edit Dompet' : 'Tambah Dompet'}>
        <WalletForm wallet={editingWallet} onClose={closeWalletModal}
          onSaved={() => fetchWallets(user?.id)} />
      </BottomSheet>

      {/* Transfer Sheet */}
      <BottomSheet isOpen={isTransferModalOpen} onClose={closeTransferModal}
        title={editingTransfer ? 'Edit Transfer' : 'Transfer Antar Dompet'}>
        <TransferForm transfer={editingTransfer} onClose={closeTransferModal}
          onSaved={() => fetchWallets(user?.id)} />
      </BottomSheet>

      {/* Subscription Sheet */}
      <BottomSheet isOpen={isSubscriptionModalOpen} onClose={closeSubscriptionModal}
        title={editingSubscription ? 'Edit Langganan' : 'Tambah Langganan'}>
        <SubscriptionForm subscription={editingSubscription} onClose={closeSubscriptionModal} />
      </BottomSheet>

      {/* Split Bill Sheet */}
      <BottomSheet isOpen={isSplitBillModalOpen} onClose={closeSplitBillModal}
        title="Split Bill">
        <SplitBillForm onClose={closeSplitBillModal} onSaved={() => refreshAll(user?.id)} />
      </BottomSheet>
    </div>
  )
}
