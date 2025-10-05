/**
 * Pagination Component - Enterprise Table Pagination
 *
 * Features:
 * - Page navigation (prev/next)
 * - Page size selector
 * - Total rows display
 * - RTL support
 * - Accessible keyboard navigation
 *
 * @component
 */

'use client'

import { cn } from '@/lib/utils'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export type PaginationProps = {
  page: number // 1-based
  pageSize: number
  totalRows: number
  onPageChange: (p: number) => void
  onPageSizeChange?: (s: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalRows / pageSize)
  const startRow = (page - 1) * pageSize + 1
  const endRow = Math.min(page * pageSize, totalRows)

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 border-t border-ui-border bg-ui-surface',
        className
      )}
    >
      {/* Rows info */}
      <div className="text-sm text-ui-text-muted">
        מציג <span className="font-medium text-ui-text">{startRow}</span> עד{' '}
        <span className="font-medium text-ui-text">{endRow}</span> מתוך{' '}
        <span className="font-medium text-ui-text">{totalRows}</span> רשומות
      </div>

      <div className="flex items-center gap-6">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-ui-text-muted whitespace-nowrap">
              שורות בעמוד:
            </label>
            <Select
              id="pageSize"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              selectSize="sm"
              className="w-20"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            aria-label="עמוד קודם"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          <span className="text-sm text-ui-text mx-2 min-w-[80px] text-center">
            עמוד {page} מתוך {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            aria-label="עמוד הבא"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
