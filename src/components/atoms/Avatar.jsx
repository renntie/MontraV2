export const Avatar = ({ name, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  return (
    <div className={`${sizes[size]} rounded-2xl bg-accent-income/20 text-accent-income font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}
