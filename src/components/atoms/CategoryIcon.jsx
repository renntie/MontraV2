import * as Icons from 'lucide-react'

/**
 * CategoryIcon
 * @param {string}  iconName   - Lucide icon name, e.g. "ShoppingBag"
 * @param {string}  color      - Hex color for icon & bg tint
 * @param {number}  size       - Icon size in px (default 18)
 * @param {string}  className  - Extra classes for the wrapper div
 */
export const CategoryIcon = ({
  iconName = 'MoreHorizontal',
  color    = '#9CA3AF',
  size     = 18,
  className = '',
}) => {
  const Icon = Icons[iconName] || Icons.MoreHorizontal
  const wrapSize = size + 16   // icon + padding

  return (
    <div
      className={`flex items-center justify-center rounded-xl flex-shrink-0 ${className}`}
      style={{
        width:      `${wrapSize}px`,
        height:     `${wrapSize}px`,
        background: `${color}1A`,   // hex alpha ~10%
      }}
    >
      <Icon size={size} style={{ color }} strokeWidth={1.8} />
    </div>
  )
}
