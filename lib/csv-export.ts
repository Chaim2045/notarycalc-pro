/**
 * CSV Export Utility
 *
 * Export data to CSV format
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; header: string }[]
) {
  // Create CSV header
  const headers = columns.map((col) => col.header).join(',')

  // Create CSV rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key]
        // Handle different types
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
        return value
      })
      .join(',')
  })

  // Combine
  const csv = [headers, ...rows].join('\n')

  // Add BOM for Excel Hebrew support
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  // Download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
