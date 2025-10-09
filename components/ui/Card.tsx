/**
 * Linear-inspired Card Component with 3D Depth
 *
 * Design Principles:
 * - Clean surface with subtle border
 * - Soft shadow on hover
 * - Subtle 3D depth effect (Linear-style)
 * - Flexible padding options
 * - Optional interactive state
 * - Respects prefers-reduced-motion
 *
 * @component
 */

'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-ui-surface
      rounded-lg
      transition-all duration-fast
      will-change-transform
    `

    const variants = {
      default: `
        border border-ui-border
      `,
      bordered: `
        border-2 border-ui-border
      `,
      elevated: `
        border border-ui-border
        shadow-sm
      `,
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const interactiveStyles = interactive
      ? `
        cursor-pointer
        hover:border-ui-border-hover
        hover:shadow-md
      `
      : ''

    const classNames = cn(
      baseStyles,
      variants[variant],
      paddings[padding],
      interactiveStyles,
      className
    )

    // Subtle 3D depth animation (Linear-style)
    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={classNames}
          whileHover={{
            rotateX: -2,
            rotateY: 2,
            translateZ: 8,
            transition: {
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          whileTap={{
            scale: 0.98,
            transition: {
              duration: 0.15,
            },
          }}
          style={{
            transformStyle: 'preserve-3d' as const,
            perspective: 1200,
            ...props.style,
          }}
          onClick={props.onClick}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={classNames}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Card Header Component
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  noBorder?: boolean
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, noBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pb-4 mb-4',
          !noBorder && 'border-b border-ui-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/**
 * Card Content Component
 */
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

/**
 * Card Footer Component
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  noBorder?: boolean
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, noBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pt-4 mt-4',
          !noBorder && 'border-t border-ui-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
