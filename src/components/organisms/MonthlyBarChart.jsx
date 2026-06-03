import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-2xl px-3 py-3 shadow-float text-xs space-y-1.5">
      <p className="font-bold text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-text-muted">
            {p.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}:
          </span>
          <span className="font-semibold text-text-primary tabular-nums">
            {formatCurrency(p.value, { compact: true })}
          </span>
        </div>
      ))}
      {payload.length >= 2 && (
        <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
          <div className="w-2 h-2 rounded-full bg-transparent" />
          <span className="text-text-muted">Saldo:</span>
          <span className={`font-bold tabular-nums ${
            (payload[0].value - payload[1].value) >= 0
              ? 'text-accent-income'
              : 'text-accent-expense'
          }`}>
            {formatCurrency(Math.abs(payload[0].value - payload[1].value), { compact: true })}
          </span>
        </div>
      )}
    </div>
  )
}

export const MonthlyBarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        Belum ada data bulanan
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="28%" barGap={3}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Plus Jakarta Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Plus Jakarta Sans' }}
          axisLine={false}
          tickLine={false}
          width={38}
          tickFormatter={(v) =>
            v >= 1e9 ? `${(v / 1e9).toFixed(1)}M` :
            v >= 1e6 ? `${(v / 1e6).toFixed(0)}jt` :
            v >= 1e3 ? `${(v / 1e3).toFixed(0)}rb` : v
          }
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
        />
        <Bar
          dataKey="income"
          name="income"
          fill="#34D399"
          radius={[5, 5, 0, 0]}
          maxBarSize={22}
        />
        <Bar
          dataKey="expense"
          name="expense"
          fill="#FB7185"
          radius={[5, 5, 0, 0]}
          maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
