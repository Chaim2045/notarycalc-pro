/**
 * Linear-inspired Button Component with 3D Micro-Interactions
 *
 * Design Principles:
 * - Flat design with subtle borders
 * - Soft hover/focus states
 * - Minimal shadows
 * - Clean typography
 * - Subtle 3D depth on hover/press
 *
 * @component
 */

'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

    const variants = {
      primary: 'bg-brand-600 text-white border border-brand-600 hover:bg-brand-500 hover:border-brand-500 active:bg-brand-600 shadow-xs hover:shadow-sm',
      secondary: 'bg-ui-surface text-ui-text border border-ui-border hover:bg-ui-surface-hover hover:border-ui-border-hover active:bg-ui-bg shadow-xs hover:shadow-sm',
      ghost: 'bg-transparent text-ui-text-secondary border border-transparent hover:bg-ui-surface hover:text-ui-text active:bg-ui-bg',
      danger: 'bg-error text-white border border-error hover:opacity-90 active:opacity-100 shadow-xs hover:shadow-sm',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-sm rounded-lg gap-2',
      lg: 'px-6 py-3 text-base rounded-lg gap-2',
    }

    // Separate motion props from HTML props to avoid type conflicts
    const motionVariants = !disabled && !isLoading ? {
      whileHover: { translateZ: 4 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
    } : {}

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          isLoading && 'opacity-70 cursor-wait',
          'will-change-transform',
          className,
          variants[variant] // variant last to ensure colors override className
        )}
        disabled={disabled || isLoading}
        {...motionVariants}
        {...(props as any)}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
