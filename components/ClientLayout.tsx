'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { MotionProvider } from '@/app/providers'
import { Toaster } from 'react-hot-toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <MotionProvider>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              direction: 'rtl',
              fontFamily: 'Heebo, sans-serif',
            },
          }}
        />
      </MotionProvider>
    </LanguageProvider>
  )
}
