'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0 })

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({ total: count || 0 })
    } catch (error) {
      logger.error('Error loading stats:', error)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleUpgrade() {
    try {
      setLoading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('שגיאה ביצירת תשלום')
      }
    } catch (error) {
      logger.error('Upgrade error:', error)
      alert('שגיאה ביצירת תשלום')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ui-text-secondary">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const daysLeft = profile?.trial_end_date
    ? Math.ceil((new Date(profile.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-ui-bg">
      {/* Header */}
      <header className="bg-ui-surface border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-ui-text">{t('appName')}</h1>
                {profile?.office_name && (
                  <p className="text-sm text-ui-text-secondary">{profile.office_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-ui-text">
                  {t('welcome')}, {profile?.full_name || t('user')}
                </p>
                {profile?.subscription_status === 'trial' && (
                  <p className="text-xs text-brand-600">
                    {daysLeft} {t('daysLeft')}
                  </p>
                )}
              </div>
              <LanguageSwitcher />
              <Button
                onClick={() => router.push('/settings')}
                variant="ghost"
                size="sm"
              >
                {t('settings')}
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
              >
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Trial Banner */}
        {profile?.subscription_status === 'trial' && (
          <Card variant="bordered" className="bg-blue-50 border-blue-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  {t('trialPeriod')} - {daysLeft} {t('daysRemaining')}
                </h3>
                <p className="text-blue-700">
                  {t('enjoyFeatures')} {new Date(profile.trial_end_date!).toLocaleDateString('he-IL')}
                </p>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                variant="primary"
                size="lg"
                isLoading={loading}
              >
                {loading ? t('redirecting') : t('upgradeNow')}
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('calculationsThisMonth')}</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">0</p>
            <p className="text-xs text-ui-text-muted mt-1">{t('noCalculationsYet')}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('totalFees')}</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">₪0</p>
            <p className="text-xs text-ui-text-muted mt-1">{t('thisMonth')}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('clientsCount')}</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">0</p>
            <p className="text-xs text-ui-text-muted mt-1">{t('inList')}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('status')}</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text capitalize">
              {profile?.subscription_status === 'trial' ? t('trial') : profile?.subscription_status}
            </p>
            <p className="text-xs text-ui-text-muted mt-1">{t('subscription')} {profile?.subscription_status === 'trial' ? t('trial') : ''}</p>
          </Card>
        </div>

        {/* Conditional: Getting Started OR Quick Actions */}
        {stats.total === 0 && !profile?.office_name ? (
          /* Show onboarding for new users */
          <Card className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-ui-text">{t('gettingStarted')}</h2>
              <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                {t('simpleSteps')}
              </span>
            </div>
            <div className="space-y-4">
              <Card interactive padding="md" onClick={() => router.push('/settings')}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ui-text mb-1">{t('completeProfile')}</h3>
                    <p className="text-sm text-ui-text-secondary">{t('addOfficeDetails')}</p>
                  </div>
                  <svg className="w-5 h-5 text-ui-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
              <Card interactive padding="md" onClick={() => router.push('/calculations/new')}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ui-text mb-1">{t('firstCalculation')}</h3>
                    <p className="text-sm text-ui-text-secondary">{t('tryCalculation')}</p>
                  </div>
                  <svg className="w-5 h-5 text-ui-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
              <Card interactive padding="md" onClick={() => router.push('/clients')}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ui-text mb-1">{t('addClients')}</h3>
                    <p className="text-sm text-ui-text-secondary">{t('createClientList')}</p>
                  </div>
                  <svg className="w-5 h-5 text-ui-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </div>
          </Card>
        ) : (
          /* Show Quick Actions for experienced users */
          <Card className="mt-12" variant="elevated" padding="lg">
            <h2 className="text-2xl font-bold text-ui-text mb-6">{t('quickActions')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card
                interactive
                padding="md"
                onClick={() => router.push('/calculations/new')}
                className="bg-gradient-to-br from-blue-50 to-blue-100 text-right group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-ui-text mb-1">{t('newCalculation')}</h3>
                <p className="text-sm text-ui-text-secondary">{t('createFee')}</p>
              </Card>

              <Card
                interactive
                padding="md"
                onClick={() => router.push('/clients')}
                className="bg-gradient-to-br from-purple-50 to-purple-100 text-right group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-ui-text mb-1">{t('newClient')}</h3>
                <p className="text-sm text-ui-text-secondary">{t('addToList')}</p>
              </Card>

              <Card
                interactive
                padding="md"
                onClick={() => router.push('/calculations/history')}
                className="bg-gradient-to-br from-green-50 to-green-100 text-right group"
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-ui-text mb-1">{t('history')}</h3>
                <p className="text-sm text-ui-text-secondary">{t('viewCalculations')}</p>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Card
                interactive
                padding="md"
                onClick={() => router.push('/analytics')}
                className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-right group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ui-text mb-1">ניתוח נתונים 📊</h3>
                    <p className="text-sm text-ui-text-secondary">גרפים, סטטיסטיקות ותובנות עסקיות</p>
                  </div>
                  <svg className="w-6 h-6 text-ui-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>

              <Card
                interactive
                padding="md"
                onClick={() => router.push('/templates')}
                className="bg-gradient-to-br from-orange-50 to-orange-100 text-right group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ui-text mb-1">תבניות שירותים 📋</h3>
                    <p className="text-sm text-ui-text-secondary">תבניות מוכנות לשימוש חוזר</p>
                  </div>
                  <svg className="w-6 h-6 text-ui-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}
