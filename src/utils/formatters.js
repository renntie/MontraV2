import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export const formatCurrency = (amount, options = {}) => {
  const { compact = false, showSign = false } = options
  const absAmount = Math.abs(amount)
  
  if (compact && absAmount >= 1_000_000_000) {
    return `Rp ${(absAmount / 1_000_000_000).toFixed(1)}M`
  }
  if (compact && absAmount >= 1_000_000) {
    return `Rp ${(absAmount / 1_000_000).toFixed(1)}jt`
  }
  if (compact && absAmount >= 1_000) {
    return `Rp ${(absAmount / 1_000).toFixed(0)}rb`
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount)

  if (showSign) return amount >= 0 ? `+${formatted}` : `-${formatted}`
  return formatted
}

export const formatDate = (dateStr, formatStr = 'dd MMM yyyy') => {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, formatStr, { locale: id })
  } catch {
    return dateStr
  }
}

export const formatRelativeDate = (dateStr) => {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    if (isToday(date)) return 'Hari ini'
    if (isYesterday(date)) return 'Kemarin'
    return format(date, 'dd MMM yyyy', { locale: id })
  } catch {
    return dateStr
  }
}

export const formatMonthYear = (dateStr) => {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'MMMM yyyy', { locale: id })
  } catch {
    return dateStr
  }
}

export const formatPercent = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}
