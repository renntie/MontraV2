import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, ArrowLeftRight, Wallet,
  Building2, Smartphone, TrendingUp, MoreHorizontal,
  ArrowUpRight, ArrowDownLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { EmptyState } from '@/components/atoms/EmptyState'
import { Spinner } from '@/components/atoms/Spinner'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWalletStore } from '@/store/walletStore'
import { transferService } from '@/services/transferService'
import { formatCurrency, formatDate } from '@/utils/formatters'

const TYPE_META = {
  cash:       { icon: Wallet,       label: 'Tunai',     bg: 'bg-accent-income/15',     text: 'text-accent-income',   color: '#34D399' },
  bank:       { icon: Building2,    label: 'Bank',      bg: 'bg-accent-blue/15',       text: 'text-accent-blue',     color: '#60A5FA' },
  ewallet:    { icon: Smartphone,   label: 'E-Wallet',  bg: 'bg-accent-purple/15',     text: 'text-accent-purple',   color: '#A78BFA' },
  investment: { icon: TrendingUp,   label: 'Investasi', bg: 'bg-accent-yellow/15',     text: 'text-accent-yellow',   color: '#FBBF24' },
  other:      { icon: MoreHorizontal,label: 'Lainnya',  bg: 'bg-bg-overlay',            text: 'text-text-muted',      color: '#9CA3AF' },
}

const TABS = [
  { id: 'wallets',   label: 'Dompet' },
  { id: 'transfers', label: 'Transfer' },
]

export const WalletsPage = () => {
  const { user }     = useAuthStore()
  const {
    openWalletModal, openTransferModal, addToast, isPrivacyMode,
  } = useUIStore()
  const {
    wallets, balances, loading,
    fetchWallets, deleteWallet, getTotalBalance,
  } = useWalletStore()

  const [tab,       setTab]      = useState('wallets')
  const [transfers, setTransfers] = useState([])
  const [txLoading, setTxLoading] = useState(false)

  useEffect(() => {
    if (user?.id) fetchWallets(user.id)
  }, [user?.id])

  const loadTransfers = useCallback(async () => {
    if (!user?.id) return
    setTxLoading(true)
    try {
      const data = await transferService.getAll(user.id)
      setTransfers(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setTxLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (tab === 'transfers') loadTransfers()
  }, [tab, loadTransfers])

  const handleDelete = async (id) => {
    if (!confirm('Hapus dompet ini? Semua transaksi yang terhubung akan terlepas.')) return
    try {
      await deleteWallet(id)
      addToast('Dompet dihapus')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleDeleteTransfer = async (id) => {
    if (!confirm('Hapus transfer ini?')) return
    try {
      await transferService.delete(id)
      setTransfers((prev) => prev.filter((t) => t.id !== id))
      // refresh balances
      fetchWallets(user.id)
      addToast('Transfer dihapus')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const totalBalance = getTotalBalance()

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-text-primary">Dompet & Transfer</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openTransferModal(null)}
              aria-label="Transfer"
              className="h-9 w-9 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center
                text-text-muted hover:text-accent-blue hover:border-accent-blue/40
                hover:bg-accent-blue/10 active:scale-95 transition-all duration-200"
            >
              <ArrowLeftRight size={15} />
            </button>
            <button
              onClick={() => openWalletModal(null)}
              aria-label="Tambah Dompet"
              className="h-9 w-9 rounded-2xl bg-accent-income flex items-center justify-center
                text-bg hover:brightness-110 active:scale-95 transition-all duration-200 shadow-glow-income/30 group"
            >
              <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        {wallets.length > 0 && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-accent-income/10 to-accent-blue/5 border-accent-income/20">
            <p className="text-xs text-text-muted mb-1">Total Semua Dompet</p>
            <p className="text-2xl font-extrabold text-text-primary">
              {isPrivacyMode ? 'Rp ••••••••' : formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-text-muted mt-1">{wallets.length} dompet aktif</p>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-elevated rounded-2xl">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-250 ${
                tab === id
                  ? 'bg-bg-surface text-text-primary shadow-card scale-[1.02]'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-28 lg:pb-6 scrollbar-hide">
        {tab === 'wallets' && (
          <div key="wallets" className="page-enter space-y-3">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner size={32} /></div>
            ) : wallets.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Belum ada dompet"
                description="Tambahkan dompet untuk memisahkan dan melacak saldo di setiap rekening, e-wallet, atau kantong tunai"
                action={
                  <Button size="sm" onClick={() => openWalletModal(null)} icon={Plus}>
                    Tambah Dompet
                  </Button>
                }
              />
            ) : (
              wallets.map((wallet, idx) => {
                const meta    = TYPE_META[wallet.type] || TYPE_META.other
                const balance = balances[wallet.id] ?? wallet.initial_balance
                return (
                  <Card
                    key={wallet.id}
                    className={`p-4 animate-fade-in stagger-${Math.min(idx + 1, 5)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                        <meta.icon size={22} className={meta.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">{wallet.name}</p>
                        <p className="text-xs text-text-muted">{meta.label}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-extrabold ${balance >= 0 ? 'text-text-primary' : 'text-accent-expense'}`}>
                          {isPrivacyMode ? '••••••••' : formatCurrency(balance, { compact: true })}
                        </p>
                        {wallet.initial_balance !== 0 && (
                          <p className="text-[10px] text-text-muted">Awal: {isPrivacyMode ? '••••••••' : formatCurrency(wallet.initial_balance, { compact: true })}</p>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={() => openTransferModal(null)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                          bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-all duration-150"
                      >
                        <ArrowLeftRight size={12} /> Transfer
                      </button>
                      <button
                        onClick={() => openWalletModal(wallet)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                          bg-bg-elevated text-text-secondary hover:bg-bg-overlay transition-all duration-150"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(wallet.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                          bg-accent-expense/10 text-accent-expense hover:bg-accent-expense/20 transition-all duration-150"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {tab === 'transfers' && (
          <div key="transfers" className="page-enter space-y-3">
            {txLoading ? (
              <div className="flex justify-center py-12"><Spinner size={32} /></div>
            ) : transfers.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="Belum ada transfer"
                description="Catat perpindahan uang antar dompet seperti top-up e-wallet atau tarik tunai"
                action={
                  <Button size="sm" onClick={() => openTransferModal(null)} icon={Plus}>
                    Catat Transfer
                  </Button>
                }
              />
            ) : (
              transfers.map((t, idx) => (
                <Card key={t.id} className={`p-4 animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent-blue/15 flex items-center justify-center flex-shrink-0">
                      <ArrowLeftRight size={18} className="text-accent-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {t.from_wallet?.name}
                        </span>
                        <ChevronRight size={10} className="text-text-muted flex-shrink-0" />
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {t.to_wallet?.name}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDate(t.date)}{t.note ? ` · ${t.note}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <p className="text-sm font-bold text-accent-blue">{formatCurrency(t.amount, { compact: true })}</p>
                      <button
                        onClick={() => handleDeleteTransfer(t.id)}
                        className="w-7 h-7 rounded-xl flex items-center justify-center
                          text-text-muted hover:text-accent-expense hover:bg-accent-expense/10 transition-all duration-150"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
