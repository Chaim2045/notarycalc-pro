/**
 * FormRow Component - Enterprise Form Field Wrapper
 *
 * Design Principles:
 * - Label + Input + Helper text + Error message in one component
 * - Required indicator (*)
 * - Accessible (proper label associations)
 * - Clean validation states
 * - RTL support
 *
 * @component
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FormRowProps {
  label?: string
  htmlFor?: string
  required?: boolean
  helpText?: string
  errorText?: string
  children: ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal'
}

export function FormRow({
  label,
  htmlFor,
  required = false,
  helpText,
  errorText,
  children,
  className,
  layout = 'vertical',
}: FormRowProps) {
  const hasError = Boolean(errorText)

  return (
    <div
      className={cn(
        'form-row',
        layout === 'horizontal' && 'flex items-start gap-4',
        className
      )}
    >
      {/* Label */}
      {label && (
        <div className={cn(layout === 'horizontal' && 'w-1/3 pt-2')}>
          <label
            htmlFor={htmlFor}
            className={cn(
              'block text-sm font-medium mb-1.5',
              hasError ? 'text-error' : 'text-ui-text'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {helpText && !hasError && (
            <p className="text-xs text-ui-text-muted mt-1">{helpText}</p>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className={cn(layout === 'horizontal' && 'flex-1')}>
        {children}

        {/* Error Message */}
        {hasError && (
          <p className="text-xs text-error mt-1.5 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorText}
          </p>
        )}
      </div>
    </div>
  )
}
