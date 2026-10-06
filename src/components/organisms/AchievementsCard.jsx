import { useState, useMemo } from 'react'
import {
  Trophy, Award, Target, Wallet, ShieldCheck, Repeat,
  HeartPulse, Flame, EyeOff, Sparkles, CheckCircle2, Lock,
  Zap, Star
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { useTransactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useUIStore } from '@/store/uiStore'

export const AchievementsCard = () => {
  const { transactions, summary } = useTransactionStore()
  const { wallets } = useWalletStore()
  const { subscriptions } = useSubscriptionStore()
  const { isPrivacyMode } = useUIStore()

  const [filter, setFilter] = useState('all') // 'all' | 'unlocked' | 'locked'

  // Calculate stats & unlock conditions
  const achievements = useMemo(() => {
    const txCount = transactions.length
    const walletCount = wallets.length
    const subCount = subscriptions.length
    
    const income = summary?.income || 0
    const expense = summary?.expense || 0
    const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0

    // 50/30/20 Score estimation
    const healthScore = income > 0 ? Math.min(100, Math.round((savingsRate / 20) * 100)) : 0

    return [
      {
        id: 'first_tx',
        title: 'Langkah Pertama',
        category: 'Transaksi',
        description: 'Mencatat transaksi keuangan pertama di Montra.',
        icon: Zap,
        color: '#3B82F6',
        isUnlocked: txCount >= 1,
        progress: Math.min(100, (txCount / 1) * 100),
        progressLabel: `${Math.min(1, txCount)}/1 Transaksi`,
      },
      {
        id: 'saver_master',
        title: 'Hemat Mania',
        category: 'Tabungan',
        description: 'Menyisihkan minimal 20% dari total pemasukan bulan ini.',
        icon: Sparkles,
        color: '#10B981',
        isUnlocked: savingsRate >= 20,
        progress: Math.min(100, (savingsRate / 20) * 100),
        progressLabel: `${savingsRate.toFixed(0)}%/20% Savings Rate`,
      },
      {
        id: 'multi_wallet',
        title: 'Keluarga Dompet',
        category: 'Akun',
        description: 'Memiliki lebih dari 1 dompet atau rekening terhubung.',
        icon: Wallet,
        color: '#8B5CF6',
        isUnlocked: walletCount > 1,
        progress: Math.min(100, (walletCount / 2) * 100),
        progressLabel: `${walletCount}/2 Dompet`,
      },
      {
        id: 'sub_master',
        title: 'Langganan Cerdas',
        category: 'Tagihan',
        description: 'Mencatat minimal 1 tagihan rutin / langganan bulanan.',
        icon: Repeat,
        color: '#F59E0B',
        isUnlocked: subCount >= 1,
        progress: Math.min(100, (subCount / 1) * 100),
        progressLabel: `${Math.min(1, subCount)}/1 Langganan`,
      },
      {
        id: 'streak_10',
        title: 'Pencatat Setia',
        category: 'Transaksi',
        description: 'Konsisten mencatat hingga 10 transaksi keuangan.',
        icon: Flame,
        color: '#EC4899',
        isUnlocked: txCount >= 10,
        progress: Math.min(100, (txCount / 10) * 100),
        progressLabel: `${Math.min(10, txCount)}/10 Transaksi`,
      },
      {
        id: 'privacy_guard',
        title: 'Penjaga Privasi',
        category: 'Keamanan',
        description: 'Mengaktifkan Mode Privasi untuk menyamarkan nominal saldo.',
        icon: EyeOff,
        color: '#06B6D4',
        isUnlocked: isPrivacyMode,
        progress: isPrivacyMode ? 100 : 0,
        progressLabel: isPrivacyMode ? 'Aktif' : 'Belum Aktif',
      },
      {
        id: 'health_hero',
        title: 'Sultan Finansial',
        category: 'Kesehatan',
        description: 'Mencapai Skor Kesehatan Finansial (Aturan 50/30/20) ≥ 80.',
        icon: HeartPulse,
        color: '#14B8A6',
        isUnlocked: healthScore >= 80,
        progress: Math.min(100, (healthScore / 80) * 100),
        progressLabel: `Skor ${healthScore}/80`,
      },
      {
        id: 'tx_pro_25',
        title: 'Master Transaksi',
        category: 'Transaksi',
        description: 'Mencatat total 25 transaksi di aplikasi.',
        icon: Trophy,
        color: '#EAB308',
        isUnlocked: txCount >= 25,
        progress: Math.min(100, (txCount / 25) * 100),
        progressLabel: `${Math.min(25, txCount)}/25 Transaksi`,
      },
    ]
  }, [transactions, summary, wallets, subscriptions, isPrivacyMode])

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalCount = achievements.length
  const overallPercentage = Math.round((unlockedCount / totalCount) * 100)

  const filteredAchievements = achievements.filter(item => {
    if (filter === 'unlocked') return item.isUnlocked
    if (filter === 'locked') return !item.isUnlocked
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header Progress Banner */}
      <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface border-border">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Trophy size={140} className="text-accent-income" />
        </div>

        <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-accent-income/15 text-accent-income border border-accent-income/20">
                Pencapaian Finansial
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-text-primary">Galeri Badge & Milestone</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Selesaikan pencapaian untuk membuka badge finansialmu!
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-accent-income/15 border border-accent-income/30 flex items-center justify-center flex-shrink-0">
            <Award size={28} className="text-accent-income animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-text-secondary flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent-income" />
              {unlockedCount} dari {totalCount} Terbuka
            </span>
            <span className="text-accent-income font-bold tabular-nums">{overallPercentage}% Complete</span>
          </div>
          <ProgressBar progress={overallPercentage} color="#34D399" />
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1.5 p-1 bg-bg-elevated rounded-xl border border-border">
          {[
            { id: 'all', label: `Semua (${totalCount})` },
            { id: 'unlocked', label: `Terbuka (${unlockedCount})` },
            { id: 'locked', label: `Terkunci (${totalCount - unlockedCount})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filter === t.id
                  ? 'bg-bg-surface text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredAchievements.map((item, idx) => {
          const IconComponent = item.icon
          const isUnlocked = item.isUnlocked

          return (
            <Card
              key={item.id}
              className={`p-4 transition-all duration-300 relative overflow-hidden group ${
                isUnlocked
                  ? 'border-border hover:border-accent-income/40 hover:shadow-md'
                  : 'opacity-65 border-dashed border-border bg-bg-surface/50'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Top Row: Icon + Category Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isUnlocked
                      ? 'shadow-sm'
                      : 'grayscale opacity-60'
                  }`}
                  style={{
                    background: isUnlocked ? `${item.color}18` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isUnlocked ? item.color + '33' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <IconComponent
                    size={22}
                    style={{ color: isUnlocked ? item.color : '#9CA3AF' }}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg-elevated border border-border text-text-muted">
                    {item.category}
                  </span>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-income/15 text-accent-income border border-accent-income/20">
                      <CheckCircle2 size={11} /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg-overlay text-text-muted">
                      <Lock size={11} /> Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 className={`text-sm font-bold mb-1 ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Individual Progress */}
                {!isUnlocked && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-[10px] text-text-muted font-medium">
                      <span>Progres</span>
                      <span className="tabular-nums font-semibold">{item.progressLabel}</span>
                    </div>
                    <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.progress}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
