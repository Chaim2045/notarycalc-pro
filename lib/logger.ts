// Logger utility - מסתיר console.error בפרודקשן
// בפרודקשן - שולח ל-monitoring service (Sentry)
// בדבלופמנט - מציג ב-console

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error)
    } else {
      // TODO: Send to Sentry/monitoring service
      // Sentry.captureException(error)
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data)
    }
  },

  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data)
    }
  }
}
