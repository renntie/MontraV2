import { Loader2 } from 'lucide-react'
export const Spinner = ({ size = 24, className = '' }) => (
  <Loader2 size={size} className={`animate-spin text-text-muted ${className}`} />
)
