'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase'
import Footer from '@/components/Footer'
import { logger } from '@/lib/logger'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  const daysLeft = profile?.trial_end_date
    ? Math.ceil((new Date(profile.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NotaryCalc Pro</h1>
                {profile?.office_name && (
                  <p className="text-sm text-gray-600">{profile.office_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  שלום, {profile?.full_name || 'משתמש'}
                </p>
                {profile?.subscription_status === 'trial' && (
                  <p className="text-xs text-blue-600">
                    {daysLeft} ימי ניסיון נותרו
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                הגדרות
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                יציאה
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Trial Banner */}
        {profile?.subscription_status === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  תקופת ניסיון - {daysLeft} ימים נותרו
                </h3>
                <p className="text-blue-700">
                  תהנה מכל התכונות חינם עד {new Date(profile.trial_end_date!).toLocaleDateString('he-IL')}
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'מעביר לתשלום...' : 'שדרג עכשיו - 39₪/חודש'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">חישובים החודש</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">עדיין לא ביצעת חישובים</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">סה״כ תעריפים</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">₪0</p>
            <p className="text-xs text-gray-500 mt-1">החודש</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">לקוחות</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">ברשימה</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">סטטוס</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {profile?.subscription_status === 'trial' ? 'ניסיון' : profile?.subscription_status}
            </p>
            <p className="text-xs text-gray-500 mt-1">מנוי {profile?.subscription_status === 'trial' ? 'ניסיון' : ''}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/calculations/new')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 text-right hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">חישוב חדש</h3>
            <p className="text-blue-100 text-sm">צור חישוב תעריף נוטריון חדש</p>
          </button>

          <button
            onClick={() => router.push('/clients')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-right hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">לקוחות</h3>
            <p className="text-gray-600 text-sm">נהל את רשימת הלקוחות שלך</p>
          </button>

          <button
            onClick={() => router.push('/calculations/history')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-right hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">היסטוריה</h3>
            <p className="text-gray-600 text-sm">צפה בחישובים קודמים</p>
          </button>
        </div>

        {/* Getting Started */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">בואו נתחיל</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">השלם את הפרופיל שלך</h3>
                <p className="text-sm text-gray-600">הוסף פרטי משרד ולוגו בהגדרות</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">צור את החישוב הראשון</h3>
                <p className="text-sm text-gray-600">נסה לבצע חישוב תעריף נוטריון</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">הוסף לקוחות</h3>
                <p className="text-sm text-gray-600">צור רשימת לקוחות לגישה מהירה</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
