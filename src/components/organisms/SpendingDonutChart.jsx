import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/formatters'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-bg-elevated border border-border rounded-2xl px-3 py-2 shadow-float text-xs">
      <p className="font-semibold text-text-primary mb-0.5">{d.name}</p>
      <p className="text-text-muted">{formatCurrency(d.amount)}</p>
    </div>
  )
}

export const SpendingDonutChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + (d.amount || 0), 0)

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-3xl bg-bg-elevated flex items-center justify-center text-2xl mb-3">
          📊
        </div>
        <p className="text-sm text-text-secondary font-medium">Belum ada pengeluaran</p>
        <p className="text-xs text-text-muted mt-1">Tambahkan transaksi untuk melihat analitik</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Donut */}
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2.5}
              dataKey="amount"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || '#9CA3AF'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] text-text-muted font-medium">Total</p>
          <p className="text-sm font-extrabold text-text-primary tabular-nums">
            {formatCurrency(total, { compact: true })}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {data.slice(0, 6).map((item, i) => {
          const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.color || '#9CA3AF' }}
              />
              <span className="text-xs text-text-secondary flex-1 truncate font-medium">
                {item.name}
              </span>
              <span className="text-xs text-text-muted tabular-nums">{pct}%</span>
              <span className="text-xs font-semibold text-text-primary tabular-nums min-w-[56px] text-right">
                {formatCurrency(item.amount, { compact: true })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
