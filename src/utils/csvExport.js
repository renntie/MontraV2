import { formatDate, formatCurrency } from './formatters'

export const exportTransactionsToCSV = (transactions, filename = 'montra-transactions') => {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Jumlah (IDR)']
  
  const rows = transactions.map(tx => [
    formatDate(tx.date),
    tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    tx.categories?.name || '-',
    tx.note || '-',
    tx.amount,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
