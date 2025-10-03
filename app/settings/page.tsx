'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    office_name: '',
    office_address: '',
    office_phone: '',
    theme: 'light' as 'light' | 'dark',
    accent_color: 'blue' as 'blue' | 'purple' | 'green' | 'red' | 'orange'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          office_name: profileData.office_name || '',
          office_address: profileData.office_address || '',
          office_phone: profileData.office_phone || '',
          theme: profileData.theme || 'light',
          accent_color: profileData.accent_color || 'blue'
        })
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('לא מחובר')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          office_name: formData.office_name,
          office_address: formData.office_address,
          office_phone: formData.office_phone,
          theme: formData.theme,
          accent_color: formData.accent_color
        })
        .eq('id', user.id)

      if (error) throw error

      showNotification('ההגדרות נשמרו בהצלחה!', 'success')
      loadProfile()
    } catch (error: any) {
      showNotification(error.message || 'שגיאה בשמירה', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleManageSubscription() {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        showNotification('שגיאה בפתיחת ניהול מנוי', 'error')
      }
    } catch (error) {
      logger.error('Portal session error:', error)
      showNotification('שגיאה בפתיחת ניהול מנוי', 'error')
    }
  }

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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
              <h1 className="text-xl font-bold text-gray-900">הגדרות</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← חזרה
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">פרטים אישיים</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם מלא *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אימייל
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות את האימייל</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Office Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">פרטי משרד</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם משרד
                </label>
                <input
                  type="text"
                  value={formData.office_name}
                  onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="משרד עו״ד כהן"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת משרד
                </label>
                <input
                  type="text"
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="רחוב הרצל 1, תל אביב"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  טלפון משרד
                </label>
                <input
                  type="tel"
                  value={formData.office_phone}
                  onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03-1234567"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">מראה</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ערכת צבעים
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'light' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.theme === 'light'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">בהיר</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'dark' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.theme === 'dark'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">כהה</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  צבע ראשי
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {['blue', 'purple', 'green', 'red', 'orange'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, accent_color: color as any })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        formData.accent_color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: {
                          blue: '#2563eb',
                          purple: '#8b5cf6',
                          green: '#10b981',
                          red: '#dc2626',
                          orange: '#f97316'
                        }[color]
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {profile && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">מנוי</h2>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    סטטוס: <span className="text-blue-600 capitalize">{profile.subscription_status}</span>
                  </p>
                  {profile.subscription_status === 'trial' && profile.trial_end_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      תקופת ניסיון עד {new Date(profile.trial_end_date).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
                {profile.subscription_status === 'active' ? (
                  <button
                    type="button"
                    onClick={handleManageSubscription}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-all"
                  >
                    נהל מנוי
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManageSubscription}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                  >
                    שדרג מנוי
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
            >
              התנתק מהמערכת
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p className="mb-1">מבוסס על תקנות הנוטריונים (שכר שירותים), תשל״ט-1978</p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} כל הזכויות שמורות • <strong>חיים פרץ</strong> • משרד עו״ד <strong>גיא הרשקוביץ</strong>
          </p>
        </footer>
      </main>
    </div>
  )
}
