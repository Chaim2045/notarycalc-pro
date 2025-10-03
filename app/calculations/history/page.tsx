'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Calculation, Profile } from '@/lib/supabase'
import Footer from '@/components/Footer'
import { logger } from '@/lib/logger'

export default function CalculationsHistoryPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      // Load calculations
      const { data: calcsData, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (calcsData) setCalculations(calcsData)
    } catch (error) {
      logger.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteCalculation(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק חישוב זה?')) return

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCalculations(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      logger.error('Error deleting:', error)
      alert('שגיאה במחיקה')
    }
  }

  const filteredCalculations = calculations.filter(calc => {
    const matchesSearch = searchTerm === '' ||
      (calc.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (calc.notes?.toLowerCase().includes(searchTerm.toLowerCase()))

    if (filterMonth === 'all') return matchesSearch

    const calcDate = new Date(calc.created_at)
    const now = new Date()

    if (filterMonth === 'this-month') {
      return matchesSearch &&
        calcDate.getMonth() === now.getMonth() &&
        calcDate.getFullYear() === now.getFullYear()
    } else if (filterMonth === 'last-month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return matchesSearch &&
        calcDate.getMonth() === lastMonth.getMonth() &&
        calcDate.getFullYear() === lastMonth.getFullYear()
    }

    return matchesSearch
  })

  // Statistics
  const stats = {
    total: calculations.length,
    thisMonth: calculations.filter(c => {
      const date = new Date(c.created_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
    totalRevenue: calculations.reduce((sum, c) => sum + c.total, 0),
    thisMonthRevenue: calculations
      .filter(c => {
        const date = new Date(c.created_at)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, c) => sum + c.total, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען היסטוריה...</p>
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">היסטוריית חישובים</h1>
                {profile?.office_name && (
                  <p className="text-sm text-gray-600">{profile.office_name}</p>
                )}
              </div>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">סה״כ חישובים</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">החודש</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">סה״כ הכנסות</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₪{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">הכנסות החודש</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₪{stats.thisMonthRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="חפש לפי שם לקוח או הערות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">כל התקופה</option>
              <option value="this-month">החודש</option>
              <option value="last-month">חודש שעבר</option>
            </select>
          </div>
        </div>

        {/* Calculations List */}
        {filteredCalculations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">אין חישובים</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'לא נמצאו תוצאות לחיפוש' : 'עדיין לא ביצעת חישובים'}
            </p>
            <button
              onClick={() => router.push('/calculations/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
            >
              צור חישוב ראשון
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCalculations.map((calc) => (
              <div
                key={calc.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {calc.client_name || 'ללא שם לקוח'}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(calc.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {calc.notes && (
                      <p className="text-sm text-gray-600 mb-3">{calc.notes}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        {calc.services?.length || 0} שירותים
                      </span>
                      <span className="font-semibold text-blue-600">
                        סה״כ: ₪{calc.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/calculations/${calc.id}`)}
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      צפה
                    </button>
                    <button
                      onClick={() => deleteCalculation(calc.id)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
