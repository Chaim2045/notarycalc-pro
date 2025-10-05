/**
 * Linear-inspired Select Component
 *
 * Design Principles:
 * - Flat design with subtle borders
 * - Soft focus states
 * - Clean typography
 * - Native select with custom styling
 *
 * @component
 */

import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'error'
  selectSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'default',
      selectSize = 'md',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      font-sans
      appearance-none
      bg-ui-surface
      cursor-pointer
      transition-all duration-fast
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-ui-bg

      /* Custom dropdown arrow */
      bg-no-repeat
      bg-[position:left_0.75rem_center]
      bg-[length:1.25rem]
      pl-10
    `

    const variants = {
      default: `
        text-ui-text
        border border-ui-border
        hover:border-ui-border-hover
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
      `,
      error: `
        text-ui-text
        border border-error
        focus:outline-none focus:ring-2 focus:ring-error focus:border-error
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md pr-9',
      md: 'px-4 py-2 text-sm rounded-lg pr-10',
      lg: 'px-4 py-3 text-base rounded-lg pr-10',
    }

    // SVG for dropdown arrow (embedded as data URI for RTL support)
    const arrowIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%236b6f7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

    return (
      <select
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[selectSize],
          fullWidth && 'w-full',
          className
        )}
        style={{
          backgroundImage: arrowIcon,
        }}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export { Select }
