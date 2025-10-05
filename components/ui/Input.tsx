/**
 * Linear-inspired Input Component
 *
 * Design Principles:
 * - Flat design with subtle borders
 * - Soft focus states with brand color ring
 * - Clean typography
 * - Support for error states
 * - Optional prefix/suffix icons
 *
 * @component
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error'
  inputSize?: 'sm' | 'md' | 'lg'
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'md',
      prefix,
      suffix,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      font-sans
      transition-all duration-fast
      placeholder:text-ui-text-muted
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-ui-bg
    `

    const variants = {
      default: `
        bg-ui-surface text-ui-text
        border border-ui-border
        hover:border-ui-border-hover
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
      `,
      error: `
        bg-ui-surface text-ui-text
        border border-error
        focus:outline-none focus:ring-2 focus:ring-error focus:border-error
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-4 py-3 text-base rounded-lg',
    }

    if (prefix || suffix) {
      return (
        <div className={cn('relative flex items-center', fullWidth && 'w-full')}>
          {prefix && (
            <div className="absolute right-3 text-ui-text-muted pointer-events-none">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[inputSize],
              prefix && 'pr-10',
              suffix && 'pl-10',
              fullWidth && 'w-full',
              className
            )}
            disabled={disabled}
            {...props}
          />
          {suffix && (
            <div className="absolute left-3 text-ui-text-muted pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[inputSize],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
