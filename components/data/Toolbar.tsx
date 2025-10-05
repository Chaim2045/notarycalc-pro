/**
 * Toolbar Component - Enterprise Table Toolbar with 3D Depth
 *
 * Features:
 * - Search input
 * - Status filter
 * - Date range picker (simple)
 * - Export actions (CSV/PDF)
 * - Primary action button
 * - RTL support
 * - Subtle depth effects on scroll
 *
 * @component
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ToolbarProps = {
  searchPlaceholder?: string
  onSearchChange?: (q: string) => void
  statusFilter?: {
    options: Array<{ value: string; label: string }>
    value?: string
    onChange?: (v: string | undefined) => void
  }
  dateRange?: {
    from?: Date
    to?: Date
    onChange?: (r: { from?: Date; to?: Date }) => void
  }
  onExportCSV?: () => void
  onExportPDF?: () => void
  primaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode }
  className?: string
}

export function Toolbar({
  searchPlaceholder = 'חיפוש...',
  onSearchChange,
  statusFilter,
  dateRange,
  onExportCSV,
  onExportPDF,
  primaryAction,
  className,
}: ToolbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect scroll for subtle depth effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-ui-surface transition-all duration-300',
        isScrolled
          ? 'border-ui-border/60 shadow-sm backdrop-blur-sm'
          : 'border-ui-border',
        className
      )}
    >
      {/* Left side: Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search */}
        {onSearchChange && (
          <div className="w-64">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange(e.target.value)}
              inputSize="sm"
              prefix={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>
        )}

        {/* Status Filter */}
        {statusFilter && (
          <Select
            value={statusFilter.value || 'all'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? undefined : e.target.value
              statusFilter.onChange?.(val)
            }}
            selectSize="sm"
            className="w-40"
          >
            <option value="all">כל הסטטוסים</option>
            {statusFilter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        {/* Date Range - Simple implementation */}
        {dateRange && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const from = e.target.value ? new Date(e.target.value) : undefined
                dateRange.onChange?.({ ...dateRange, from })
              }}
              inputSize="sm"
              className="w-36"
            />
            <span className="text-ui-text-muted">-</span>
            <Input
              type="date"
              value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const to = e.target.value ? new Date(e.target.value) : undefined
                dateRange.onChange?.({ ...dateRange, to })
              }}
              inputSize="sm"
              className="w-36"
            />
          </div>
        )}
      </div>

      {/* Right side: Export + Primary Action */}
      <div className="flex items-center gap-2">
        {/* Export buttons */}
        {(onExportCSV || onExportPDF) && (
          <div className="flex items-center gap-1 border-l border-ui-border pl-2">
            {onExportCSV && (
              <Button variant="ghost" size="sm" onClick={onExportCSV} title="ייצא ל-CSV">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Button>
            )}
            {onExportPDF && (
              <Button variant="ghost" size="sm" onClick={onExportPDF} title="ייצא ל-PDF">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Primary Action */}
        {primaryAction && (
          <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
            {primaryAction.icon}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}
