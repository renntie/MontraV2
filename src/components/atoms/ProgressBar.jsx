export const ProgressBar = ({ value, max, color = '#34D399', className = '' }) => {
  const pct   = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const isOver = pct >= 100

  return (
    <div className={`w-full bg-bg-overlay rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-smooth relative"
        style={{
          width:      `${pct}%`,
          background: isOver
            ? 'linear-gradient(90deg, #FB7185aa, #FB7185)'
            : `linear-gradient(90deg, ${color}88, ${color})`,
        }}
      >
        {/* Shimmer effect on active bars */}
        {pct > 0 && pct < 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
            -translate-x-full animate-shimmer" />
        )}
      </div>
    </div>
  )
}
