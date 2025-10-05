/**
 * Toast Notification System
 *
 * Enterprise-grade toast notifications with:
 * - Success, error, info, warning types
 * - Promise handling for async operations
 * - RTL support
 * - Accessibility
 */

import { toast as hotToast } from 'react-hot-toast'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  duration?: number
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return hotToast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-center',
      style: {
        background: '#10B981',
        color: '#fff',
        fontFamily: 'Heebo, sans-serif',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    })
  },

  error: (message: string, options?: ToastOptions) => {
    return hotToast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-center',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontFamily: 'Heebo, sans-serif',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    })
  },

  info: (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-center',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontFamily: 'Heebo, sans-serif',
      },
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-center',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontFamily: 'Heebo, sans-serif',
      },
    })
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: options?.position || 'top-center',
        style: {
          fontFamily: 'Heebo, sans-serif',
        },
      }
    )
  },

  custom: (message: string, type?: ToastType, options?: ToastOptions) => {
    const styles = {
      success: { background: '#10B981', color: '#fff' },
      error: { background: '#EF4444', color: '#fff' },
      info: { background: '#3B82F6', color: '#fff' },
      warning: { background: '#F59E0B', color: '#fff' },
    }

    return hotToast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-center',
      style: {
        ...styles[type || 'info'],
        fontFamily: 'Heebo, sans-serif',
      },
    })
  },
}
