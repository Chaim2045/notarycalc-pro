/**
 * DataTable Component - Enterprise Data Grid
 *
 * Features:
 * - Client-side sorting
 * - Multi-select with bulk actions
 * - Density modes (comfortable/compact)
 * - Sticky headers
 * - RTL support
 * - Full accessibility (WCAG AA)
 * - Responsive with horizontal scroll
 *
 * @component
 */

'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export type Density = 'comfortable' | 'compact'
export type SortDir = 'asc' | 'desc' | null

export type Column<T> = {
  id: string
  header: string | React.ReactNode
  accessor?: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  width?: number | string
  align?: 'start' | 'center' | 'end'
  renderCell?: (row: T) => React.ReactNode
}

type SelectionMode = 'none' | 'multi'

export type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  selection?: SelectionMode
  onSelectionChange?: (keys: Array<T[keyof T]>) => void
  sort?: { columnId: string; dir: SortDir } | null
  onSortChange?: (s: { columnId: string; dir: SortDir } | null) => void
  density?: Density
  loading?: boolean
  emptyState?: { icon?: React.ReactNode; title: string; description?: string }
  stickyHeader?: boolean
  pageSize?: number
  page?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  selection = 'none',
  onSelectionChange,
  sort,
  onSortChange,
  density = 'comfortable',
  loading = false,
  emptyState,
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<T[keyof T]>>(new Set())

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort || !sort.dir) return data

    const column = columns.find((c) => c.id === sort.columnId)
    if (!column || !column.sortable) return data

    return [...data].sort((a, b) => {
      let aVal: any
      let bVal: any

      if (column.renderCell) {
        return 0 // Can't sort on custom renders
      }

      if (typeof column.accessor === 'function') {
        aVal = column.accessor(a)
        bVal = column.accessor(b)
      } else if (column.accessor) {
        aVal = a[column.accessor]
        bVal = b[column.accessor]
      } else {
        return 0
      }

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.dir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.dir === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }, [data, sort, columns])

  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    if (!column || !column.sortable || !onSortChange) return

    if (!sort || sort.columnId !== columnId) {
      onSortChange({ columnId, dir: 'asc' })
    } else if (sort.dir === 'asc') {
      onSortChange({ columnId, dir: 'desc' })
    } else {
      onSortChange(null)
    }
  }

  const handleSelectAll = () => {
    if (selectedKeys.size === sortedData.length) {
      setSelectedKeys(new Set())
      onSelectionChange?.([])
    } else {
      const allKeys = new Set(sortedData.map((row) => row[keyField]))
      setSelectedKeys(allKeys)
      onSelectionChange?.(Array.from(allKeys))
    }
  }

  const handleSelectRow = (key: T[keyof T]) => {
    const newSelection = new Set(selectedKeys)
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    setSelectedKeys(newSelection)
    onSelectionChange?.(Array.from(newSelection))
  }

  const densityClasses = {
    comfortable: 'py-3 px-4',
    compact: 'py-2 px-3 text-sm',
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-ui-text-muted">טוען...</p>
        </div>
      </div>
    )
  }

  if (sortedData.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        {emptyState?.icon && <div className="mb-4">{emptyState.icon}</div>}
        <h3 className="text-lg font-medium text-ui-text mb-2">
          {emptyState?.title || 'אין נתונים'}
        </h3>
        {emptyState?.description && (
          <p className="text-sm text-ui-text-muted">{emptyState.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-ui-border shadow-xs', className)}>
      <table className="w-full border-collapse">
        <thead
          className={cn(
            'bg-neutral-50/50 border-b border-ui-border',
            stickyHeader && 'sticky top-0 bg-[var(--ui-surface)]/95 backdrop-blur z-10'
          )}
        >
          <tr>
            {selection === 'multi' && (
              <th
                scope="col"
                className={cn('border-b border-ui-border', densityClasses[density])}
                style={{ width: '40px' }}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.size === sortedData.length && sortedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-ui-border focus:ring-2 focus:ring-brand-500"
                  aria-label="בחר הכל"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'border-b border-ui-border text-xs font-semibold text-ui-text-secondary uppercase tracking-wide',
                  densityClasses[density],
                  column.sortable && 'cursor-pointer select-none hover:bg-ui-surface-hover transition-colors',
                  column.align === 'center' && 'text-center',
                  column.align === 'end' && 'text-end',
                  column.align === 'start' && 'text-start'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sort?.columnId === column.id && (
                    <span className="text-brand-600">
                      {sort.dir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowKey = row[keyField]
            const isSelected = selectedKeys.has(rowKey)

            return (
              <tr
                key={String(rowKey)}
                className={cn(
                  'border-b border-ui-border last:border-b-0',
                  'hover:bg-neutral-50/50 transition-colors',
                  index % 2 === 1 && 'bg-neutral-50/20',
                  isSelected && 'bg-brand-50/30'
                )}
              >
                {selection === 'multi' && (
                  <td className={densityClasses[density]}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowKey)}
                      className="rounded border-ui-border focus:ring-2 focus:ring-brand-500"
                      aria-label={`בחר שורה ${index + 1}`}
                    />
                  </td>
                )}
                {columns.map((column) => {
                  let cellContent: React.ReactNode

                  if (column.renderCell) {
                    cellContent = column.renderCell(row)
                  } else if (typeof column.accessor === 'function') {
                    cellContent = column.accessor(row)
                  } else if (column.accessor) {
                    cellContent = row[column.accessor]
                  }

                  return (
                    <td
                      key={column.id}
                      className={cn(
                        'text-ui-text',
                        densityClasses[density],
                        column.align === 'center' && 'text-center',
                        column.align === 'end' && 'text-end',
                        column.align === 'start' && 'text-start'
                      )}
                    >
                      {cellContent}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
