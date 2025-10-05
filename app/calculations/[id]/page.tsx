'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Calculation } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'

export default function CalculationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const supabase = createClient()
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalculation()
  }, [params.id])

  async function loadCalculation() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setCalculation(data)
    } catch (error) {
      logger.error('Error loading calculation:', error)
      alert(t('loadError'))
      router.push('/calculations/history')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingCalculation')}</p>
        </div>
      </div>
    )
  }

  if (!calculation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('calculationNotFound')}</p>
          <button
            onClick={() => router.push('/calculations/history')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('back')} {t('history')}
          </button>
        </div>
      </div>
    )
  }

  const services = (() => {
    try {
      return typeof calculation.services === 'string'
        ? JSON.parse(calculation.services)
        : calculation.services
    } catch {
      return []
    }
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{t('calculationDetails')}</h1>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('printPdf')}
              </button>
              <button
                onClick={() => router.push('/calculations/history')}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← {t('back')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Header Info */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {calculation.client_name || t('noClientName')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('date')}: {new Date(calculation.created_at).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {calculation.notes && (
              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {t('notes')}: {calculation.notes}
              </p>
            )}
          </div>

          {/* Services List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('services')}</h3>
            <div className="space-y-3">
              {Array.isArray(services) && services.map((service: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.description}</p>
                    {service.quantity > 1 && (
                      <p className="text-sm text-gray-600">{t('quantity')}: {service.quantity}</p>
                    )}
                    {service.copies > 1 && (
                      <p className="text-sm text-gray-600">{t('copies')}: {service.copies}</p>
                    )}
                    {service.pages > 1 && (
                      <p className="text-sm text-gray-600">{t('pages')}: {service.pages}</p>
                    )}
                    {service.translationWords > 0 && (
                      <p className="text-sm text-gray-600">{t('translationWords')}: {service.translationWords}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₪{(service.basePrice * service.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>{t('subtotal')}:</span>
                <span className="font-mono">₪{calculation.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('vat')}:</span>
                <span className="font-mono">₪{calculation.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                <span>{t('totalToPay')}:</span>
                <span className="font-mono text-blue-600">₪{calculation.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>{t('basedOnRegulations')}</p>
            <p className="mt-1">© {new Date().getFullYear()} {t('appName')}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
