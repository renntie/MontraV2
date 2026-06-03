/**
 * MontraLogo — SVG logo inline yang merepresentasikan logo brand Montra
 * (huruf M dengan panah ke kanan atas, mengambil inspirasi dari logo PNG)
 */
export const MontraLogo = ({ size = 'md', showText = true, className = '' }) => {
  const dims = {
    sm: { icon: 28, textClass: 'text-base',  gap: 'gap-2' },
    md: { icon: 34, textClass: 'text-lg',    gap: 'gap-2.5' },
    lg: { icon: 44, textClass: 'text-2xl',   gap: 'gap-3' },
    xl: { icon: 60, textClass: 'text-3xl',   gap: 'gap-3' },
  }
  const d = dims[size] || dims.md

  return (
    <div className={`flex items-center ${d.gap} ${className}`}>
      {/* Icon */}
      <div
        className="flex-shrink-0 rounded-[28%] overflow-hidden bg-[#1A1A1A]
          shadow-glow-income/20 transition-transform duration-300 hover:scale-105"
        style={{ width: d.icon, height: d.icon }}
      >
        <MontraSVGIcon size={d.icon} />
      </div>

      {/* Wordmark */}
      {showText && (
        <div>
          <h1 className={`${d.textClass} font-extrabold text-text-primary tracking-tight leading-none`}>
            Montra
          </h1>
          <p className="text-[10px] text-text-muted mt-0.5 leading-none">Personal Finance</p>
        </div>
      )}
    </div>
  )
}

/**
 * MontraSVGIcon — SVG ikon M+panah yang dirender inline
 * Sesuai dengan logo PNG yang diberikan user
 */
export const MontraSVGIcon = ({ size = 34, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Dark background */}
    <rect width="100" height="100" rx="22" fill="#1A1A1A" />

    {/*
      M shape dengan panah ke atas-kanan di kaki kanan
      Koordinat dikalibrasi agar proporsional mirip logo asli
    */}
    <path
      d="
        M 14 76
        L 14 28
        L 35 58
        L 50 28
        L 65 58
        L 65 42
      "
      stroke="#34D399"
      strokeWidth="11"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Shaft panah horizontal */}
    <line
      x1="65" y1="28"
      x2="86" y2="28"
      stroke="#34D399"
      strokeWidth="11"
      strokeLinecap="round"
    />

    {/* Kepala panah atas */}
    <polyline
      points="74,18 86,28 74,38"
      stroke="#34D399"
      strokeWidth="11"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)
