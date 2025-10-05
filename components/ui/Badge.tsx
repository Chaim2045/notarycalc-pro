/**
 * Badge Component - Enterprise Status Indicators
 *
 * Design Principles:
 * - Subtle colors for professional look
 * - Clear status communication
 * - Accessible contrast ratios (AA compliant)
 * - Compact and clean
 *
 * @component
 */

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'neutral' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'sm', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-md
      transition-colors duration-fast
    `

    const variants = {
      success: `
        bg-green-50 text-green-700
        border border-green-200
        dark:bg-green-900/20 dark:text-green-400 dark:border-green-800
      `,
      neutral: `
        bg-neutral-100 text-neutral-700
        border border-neutral-200
        dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700
      `,
      warning: `
        bg-yellow-50 text-yellow-700
        border border-yellow-200
        dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800
      `,
      danger: `
        bg-red-50 text-red-700
        border border-red-200
        dark:bg-red-900/20 dark:text-red-400 dark:border-red-800
      `,
      info: `
        bg-blue-50 text-blue-700
        border border-blue-200
        dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800
      `,
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
