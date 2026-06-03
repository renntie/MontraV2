import { useEffect, useState } from 'react'
import { Plus, Download, X, ArrowLeftRight } from 'lucide-react'
import { SearchBar } from '@/components/molecules/SearchBar'
import { TransactionItem } from '@/components/molecules/TransactionItem'
import { MonthPicker } from '@/components/molecules/MonthPicker'
import { BottomSheet } from '@/components/molecules/BottomSheet'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/atoms/EmptyState'
import { Card } from '@/components/atoms/Card'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { exportTransactionsToCSV } from '@/utils/csvExport'
import { formatRelativeDate } from '@/utils/formatters'

export const TransactionsPage = () => {
  const { user }              = useAuthStore()
  const {
    transactions, loading,
    selectedMonth, setSelectedMonth,
    fetchTransactions, deleteTransaction,
    filters, setFilters, clearFilters,
  }                           = useTransactionStore()
  const { categories }        = useCategoryStore()
  const { openTransactionModal, addToast } = useUIStore()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  useEffect(() => {
    if (user?.id) fetchTransactions(user.id)
  }, [user?.id, selectedMonth, filters])

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return
    try { await deleteTransaction(id); addToast('Transaksi dihapus') }
    catch (err) { addToast(err.message, 'error') }
  }

  const handleExport = () => {
    if (!transactions.length) { addToast('Tidak ada data untuk diekspor', 'info'); return }
    exportTransactionsToCSV(transactions)
    addToast('Data berhasil diekspor 📊')
  }

  const grouped = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})

  const hasActiveFilters = filters.type || filters.categoryId

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-text-primary">Transaksi</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="h-9 w-9 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center
                text-text-muted hover:text-text-primary hover:bg-bg-overlay hover:scale-105
                transition-all duration-200"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => openTransactionModal()}
              className="h-9 w-9 rounded-2xl bg-accent-income flex items-center justify-center
                text-bg hover:brightness-110 hover:scale-105 active:scale-95
                transition-all duration-200 shadow-glow-income/20 group"
            >
              <Plus size={17} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Search & Filter */}
      <div className="px-4 lg:px-6 pb-3 flex-shrink-0 space-y-2">
        <SearchBar onFilterClick={() => setFilterSheetOpen(true)} />
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in-down">
            {filters.type && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl
                bg-accent-income/10 text-accent-income text-xs font-semibold
                border border-accent-income/20">
                {filters.type === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                <button
                  onClick={() => setFilters({ type: null })}
                  className="hover:scale-110 transition-transform duration-150"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {filters.categoryId && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl
                bg-accent-blue/10 text-accent-blue text-xs font-semibold
                border border-accent-blue/20">
                {categories.find((c) => c.id === filters.categoryId)?.name || 'Kategori'}
                <button
                  onClick={() => setFilters({ categoryId: null })}
                  className="hover:scale-110 transition-transform duration-150"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-accent-expense transition-colors duration-150
                hover:underline"
            >
              Reset semua
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={32} /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Belum ada transaksi"
            description={hasActiveFilters ? 'Coba ubah atau reset filter' : 'Tambahkan transaksi pertama Anda'}
            action={!hasActiveFilters && (
              <Button size="sm" icon={Plus} onClick={() => openTransactionModal()}>Tambah Transaksi</Button>
            )}
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, txs], groupIdx) => (
              <div
                key={date}
                className="animate-fade-in-up"
                style={{ animationDelay: `${groupIdx * 50}ms` }}
              >
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-1">
                  {formatRelativeDate(date)}
                </p>
                <Card className="divide-y divide-border/40 overflow-hidden">
                  {txs.map((tx, txIdx) => (
                    <div
                      key={tx.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${(groupIdx * 50) + (txIdx * 30)}ms` }}
                    >
                      <TransactionItem
                        transaction={tx}
                        onEdit={(t) => openTransactionModal(t)}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Transaksi"
      >
        <div className="p-5 space-y-5 pb-6">
          {/* Type filter */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Tipe</label>
            <div className="flex gap-2">
              {[[null, 'Semua'], ['income', '↑ Pemasukan'], ['expense', '↓ Pengeluaran']].map(([val, label]) => (
                <button
                  key={String(val)}
                  onClick={() => setFilters({ type: val })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200
                    hover:scale-[1.02] active:scale-[0.98]
                    ${filters.type === val
                      ? 'border-accent-income bg-accent-income/10 text-accent-income'
                      : 'border-border text-text-muted hover:border-border-strong'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Kategori</label>
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ categoryId: filters.categoryId === cat.id ? null : cat.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border truncate
                    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${filters.categoryId === cat.id
                      ? 'border-accent-income bg-accent-income/10 text-accent-income'
                      : 'border-border text-text-muted hover:border-border-strong'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1"
              onClick={() => { clearFilters(); setFilterSheetOpen(false) }}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setFilterSheetOpen(false)}>
              Terapkan
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
