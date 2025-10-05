/**
 * Linear-inspired Modal Component
 *
 * Design Principles:
 * - Clean overlay with backdrop blur
 * - Centered dialog with soft shadow
 * - Smooth animations
 * - Accessible with keyboard support
 * - Portal-based rendering
 *
 * @component
 */

'use client'

import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onClose,
      size = 'md',
      closeOnBackdrop = true,
      closeOnEsc = true,
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)

    // Handle ESC key
    useEffect(() => {
      if (!open || !closeOnEsc || !onClose) return

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }, [open, closeOnEsc, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = 'unset'
        }
      }
    }, [open])

    if (!open) return null

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
      full: 'max-w-full mx-4',
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdrop && onClose && e.target === e.currentTarget) {
        onClose()
      }
    }

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-fast" />

        {/* Modal Dialog */}
        <div
          ref={ref || modalRef}
          className={cn(
            'relative z-10 w-full',
            'bg-ui-surface',
            'rounded-xl',
            'border border-ui-border',
            'shadow-xl',
            'transition-all duration-fast',
            'animate-in fade-in-0 zoom-in-95',
            sizes[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  }
)

Modal.displayName = 'Modal'

/**
 * Modal Header Component
 */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  showCloseButton?: boolean
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, onClose, showCloseButton = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          'p-6 pb-4',
          'border-b border-ui-border',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="mr-2 p-1 rounded-md text-ui-text-secondary hover:text-ui-text hover:bg-ui-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

ModalHeader.displayName = 'ModalHeader'

/**
 * Modal Content Component
 */
const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    )
  }
)

ModalContent.displayName = 'ModalContent'

/**
 * Modal Footer Component
 */
const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3',
          'p-6 pt-4',
          'border-t border-ui-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalContent, ModalFooter }
