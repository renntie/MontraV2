import { useMemo } from 'react'
import {
  ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp,
  HeartPulse, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { useUIStore } from '@/store/uiStore'

// Kategori default yang dikelompokkan ke Kebutuhan (Needs)
const NEEDS_CATEGORIES = new Set([
  'food', 'makanan', 'transport', 'transportasi', 'bills', 'tagihan',
  'electricity', 'listrik', 'water', 'air', 'internet', 'phone', 'pulsa',
  'health', 'kesehatan', 'medicine', 'obat', 'education', 'pendidikan',
  'home', 'kos', 'sewa', 'rumah', 'fuel', 'bensin'
])

export const FinancialHealthCard = ({ transactions = [], summary = {} }) => {
  const { isPrivacyMode } = useUIStore()
  const income = summary.income || 0
  const expense = summary.expense || 0

  const analysis = useMemo(() => {
    let needs = 0
    let wants = 0

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = (t.categories?.name || '').toLowerCase()
        const catKey = (t.categories?.icon || '').toLowerCase()
        const isNeed = NEEDS_CATEGORIES.has(catName) || NEEDS_CATEGORIES.has(catKey)
        if (isNeed) {
          needs += t.amount
        } else {
          wants += t.amount
        }
      })

    const netSavings = Math.max(0, income - expense)
    const totalAllocated = income > 0 ? income : (needs + wants)

    const needsPct = totalAllocated > 0 ? (needs / totalAllocated) * 100 : 0
    const wantsPct = totalAllocated > 0 ? (wants / totalAllocated) * 100 : 0
    const savingsPct = income > 0 ? (netSavings / income) * 100 : 0

    // Kalkulasi Skor Kesehatan (0 - 100)
    let score = 100

    // Penalti jika defisit (pengeluaran > pemasukan)
    if (expense > income && income > 0) {
      const deficitRatio = (expense - income) / income
      score -= Math.min(45, deficitRatio * 50)
    }

    // Penalti deviasi Needs (target <= 50%)
    if (needsPct > 50) {
      score -= Math.min(25, (needsPct - 50) * 0.8)
    }

    // Penalti deviasi Wants (target <= 30%)
    if (wantsPct > 30) {
      score -= Math.min(25, (wantsPct - 30) * 0.8)
    }

    // Penalti Tabungan (target >= 20%)
    if (savingsPct < 20 && income > 0) {
      score -= Math.min(25, (20 - savingsPct) * 1.2)
    }

    score = Math.max(10, Math.min(100, Math.round(score)))

    let status = {
      label: 'Sangat Sehat',
      desc: 'Pengeluaran dan tabungan kamu dalam kondisi prima dan disiplin.',
      color: '#34D399',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      icon: ShieldCheck,
    }

    if (score < 45) {
      status = {
        label: 'Perlu Perhatian',
        desc: 'Pengeluaran melebihi pemasukan atau tabungan kamu sangat minim bulan ini.',
        color: '#FB7185',
        bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        icon: AlertTriangle,
      }
    } else if (score < 75) {
      status = {
        label: 'Cukup Baik',
        desc: 'Pola keuangan stabil, namun pengeluaran non-primer masih bisa dioptimalkan.',
        color: '#FBBF24',
        bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        icon: AlertCircle,
      }
    }

    // Rekomendasi Cerdas
    const tips = []
    if (expense > income && income > 0) {
      tips.push('Pengeluaranmu melebihi pemasukan bulan ini. Tinjau transaksi keinginan/hiburan.')
    }
    if (wantsPct > 35) {
      tips.push(`Porsi keinginan (${wantsPct.toFixed(0)}%) melebihi anjuran ideal 30%. Coba kurangi belanja impulsif.`)
    }
    if (savingsPct >= 20) {
      tips.push('Luar biasa! Rasio tabungan kamu sudah mencapai target ideal minimal 20%.')
    } else if (income > 0) {
      tips.push('Usahakan sisihkan minimal 10-20% di awal bulan sebelum mulai berbelanja.')
    }

    return {
      needs,
      wants,
      netSavings,
      needsPct,
      wantsPct,
      savingsPct,
      score,
      status,
      tips,
    }
  }, [transactions, income, expense])

  const StatusIcon = analysis.status.icon

  return (
    <div className="space-y-4">
      {/* Hero Health Score Card */}
      <Card className="p-5 border-border relative overflow-hidden animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <HeartPulse size={16} className="text-accent-blue" />
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Financial Health Score
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-text-primary tabular-nums">
                {analysis.score}
              </span>
              <span className="text-sm font-semibold text-text-muted">/ 100</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border mt-2.5 ${analysis.status.bgColor}`}>
              <StatusIcon size={13} strokeWidth={2.4} />
              <span className="text-xs font-bold">{analysis.status.label}</span>
            </div>
          </div>

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border"
            style={{
              backgroundColor: `${analysis.status.color}15`,
              borderColor: `${analysis.status.color}30`,
              color: analysis.status.color,
            }}
          >
            <StatusIcon size={28} strokeWidth={2.2} />
          </div>
        </div>

        <p className="text-xs text-text-muted mt-3 leading-relaxed">
          {analysis.status.desc}
        </p>

        {/* Progress Bar Score */}
        <div className="mt-4">
          <div className="h-2 bg-bg-overlay rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-smooth"
              style={{
                width: `${analysis.score}%`,
                backgroundColor: analysis.status.color,
              }}
            />
          </div>
        </div>
      </Card>

      {/* 50 / 30 / 20 Rule Breakdown */}
      <Card className="p-5 border-border animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkles size={15} className="text-amber-400" />
              Aturan Finansial 50 / 30 / 20
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Standar alokasi: 50% Kebutuhan, 30% Keinginan, 20% Tabungan
            </p>
          </div>
        </div>

        {/* Multi-colored Stacked Progress */}
        <div className="h-3 rounded-full overflow-hidden flex bg-bg-overlay gap-0.5 mb-5 p-0.5">
          <div
            className="h-full rounded-l-full bg-accent-blue transition-all duration-500"
            style={{ width: `${Math.min(100, analysis.needsPct)}%` }}
            title="Kebutuhan"
          />
          <div
            className="h-full bg-accent-purple transition-all duration-500"
            style={{ width: `${Math.min(100, analysis.wantsPct)}%` }}
            title="Keinginan"
          />
          <div
            className="h-full rounded-r-full bg-accent-income transition-all duration-500"
            style={{ width: `${Math.min(100, analysis.savingsPct)}%` }}
            title="Tabungan"
          />
        </div>

        {/* 3 Categories Breakdown List */}
        <div className="space-y-3.5">
          {/* Needs */}
          <div className="p-3 rounded-2xl bg-bg-elevated/50 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                <span className="font-bold text-text-primary">Kebutuhan (Needs)</span>
                <span className="text-[10px] text-text-muted">Target: 50%</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-text-primary tabular-nums">
                  {analysis.needsPct.toFixed(0)}%
                </span>
                <span className="text-text-muted text-[11px] ml-1.5">
                  ({isPrivacyMode ? '••••••••' : formatCurrency(analysis.needs, { compact: true })})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  analysis.needsPct > 55 ? 'bg-rose-400' : 'bg-accent-blue'
                }`}
                style={{ width: `${Math.min(100, analysis.needsPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              Makanan pokok, transportasi harian, tagihan rutin, kesehatan, tempat tinggal
            </p>
          </div>

          {/* Wants */}
          <div className="p-3 rounded-2xl bg-bg-elevated/50 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                <span className="font-bold text-text-primary">Keinginan (Wants)</span>
                <span className="text-[10px] text-text-muted">Target: 30%</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-text-primary tabular-nums">
                  {analysis.wantsPct.toFixed(0)}%
                </span>
                <span className="text-text-muted text-[11px] ml-1.5">
                  ({isPrivacyMode ? '••••••••' : formatCurrency(analysis.wants, { compact: true })})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  analysis.wantsPct > 35 ? 'bg-amber-400' : 'bg-accent-purple'
                }`}
                style={{ width: `${Math.min(100, analysis.wantsPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              Belanja pakaian/gadget, nongkrong, hiburan, liburan, langganan streaming
            </p>
          </div>

          {/* Savings */}
          <div className="p-3 rounded-2xl bg-bg-elevated/50 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-income" />
                <span className="font-bold text-text-primary">Tabungan & Investasi</span>
                <span className="text-[10px] text-text-muted">Target: 20%</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-accent-income tabular-nums">
                  {analysis.savingsPct.toFixed(0)}%
                </span>
                <span className="text-text-muted text-[11px] ml-1.5">
                  ({isPrivacyMode ? '••••••••' : formatCurrency(analysis.netSavings, { compact: true })})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-bg-overlay rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-income transition-all duration-500"
                style={{ width: `${Math.min(100, analysis.savingsPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              Sisa saldo bersih bulanan, dana darurat, dan target tabungan masa depan
            </p>
          </div>
        </div>
      </Card>

      {/* Smart Recommendations */}
      {analysis.tips.length > 0 && (
        <Card className="p-4 border-border/80 bg-bg-surface animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <Info size={14} className="text-accent-blue" />
            <h3 className="text-xs font-bold text-text-primary">Catatan & Rekomendasi Pintar</h3>
          </div>
          <div className="space-y-2">
            {analysis.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
