'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Calculation, Profile } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { toast } from '@/lib/toast'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'3months' | '6months' | '12months'>('6months')

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

      // Load all calculations
      const { data: calcsData, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (calcsData) setCalculations(calcsData)
    } catch (error) {
      logger.error('Error loading data:', error)
      toast.error('שגיאה בטעינת נתונים')
    } finally {
      setLoading(false)
    }
  }

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const months = dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12
    const startDate = subMonths(new Date(), months)

    const monthsArray = eachMonthOfInterval({
      start: startDate,
      end: new Date(),
    })

    return monthsArray.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthCalcs = calculations.filter((calc) => {
        const calcDate = new Date(calc.created_at)
        return calcDate >= monthStart && calcDate <= monthEnd
      })

      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthCalcs.reduce((sum, calc) => sum + calc.total, 0),
        count: monthCalcs.length,
      }
    })
  }, [calculations, dateRange])

  // Top clients
  const topClients = useMemo(() => {
    const clientRevenue = new Map<string, number>()

    calculations.forEach((calc) => {
      const client = calc.client_name || 'לא ידוע'
      const current = clientRevenue.get(client) || 0
      clientRevenue.set(client, current + calc.total)
    })

    return Array.from(clientRevenue.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [calculations])

  // Popular services
  const popularServices = useMemo(() => {
    const serviceCount = new Map<string, number>()

    calculations.forEach((calc) => {
      try {
        const services = typeof calc.services === 'string'
          ? JSON.parse(calc.services)
          : calc.services

        if (Array.isArray(services)) {
          services.forEach((service: any) => {
            const name = service.name || service.description || 'לא ידוע'
            const count = serviceCount.get(name) || 0
            serviceCount.set(name, count + 1)
          })
        }
      } catch (error) {
        logger.error('Error parsing services:', error)
      }
    })

    return Array.from(serviceCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [calculations])

  // KPIs
  const kpis = useMemo(() => {
    const totalRevenue = calculations.reduce((sum, calc) => sum + calc.total, 0)
    const thisMonth = calculations.filter((calc) => {
      const calcDate = new Date(calc.created_at)
      const now = new Date()
      return (
        calcDate.getMonth() === now.getMonth() &&
        calcDate.getFullYear() === now.getFullYear()
      )
    })

    const thisMonthRevenue = thisMonth.reduce((sum, calc) => sum + calc.total, 0)
    const avgCalculation = calculations.length > 0 ? totalRevenue / calculations.length : 0

    return {
      totalRevenue,
      thisMonthRevenue,
      totalCalculations: calculations.length,
      thisMonthCalculations: thisMonth.length,
      avgCalculation,
    }
  }, [calculations])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ui-text-secondary">טוען נתונים...</p>
        </div>
      </div>
    )
  }

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
                <h1 className="text-xl font-bold text-ui-text">ניתוח נתונים</h1>
                {profile?.office_name && (
                  <p className="text-sm text-ui-text-secondary">{profile.office_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                ← חזרה
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">סה"כ הכנסות</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">₪{kpis.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-ui-text-muted mt-1">מכל הזמנים</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">החודש</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">₪{kpis.thisMonthRevenue.toLocaleString()}</p>
            <p className="text-xs text-ui-text-muted mt-1">{kpis.thisMonthCalculations} חישובים</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">ממוצע חישוב</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">₪{Math.round(kpis.avgCalculation).toLocaleString()}</p>
            <p className="text-xs text-ui-text-muted mt-1">לכל חישוב</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">סה"כ חישובים</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">{kpis.totalCalculations}</p>
            <p className="text-xs text-ui-text-muted mt-1">מאז ההתחלה</p>
          </Card>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={dateRange === '3months' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setDateRange('3months')}
          >
            3 חודשים
          </Button>
          <Button
            variant={dateRange === '6months' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setDateRange('6months')}
          >
            6 חודשים
          </Button>
          <Button
            variant={dateRange === '12months' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setDateRange('12months')}
          >
            12 חודשים
          </Button>
        </div>

        {/* Revenue Chart */}
        <Card variant="elevated" padding="lg" className="mb-8">
          <h2 className="text-lg font-bold text-ui-text mb-6">הכנסות חודשיות</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E9ED" />
              <XAxis dataKey="month" stroke="#60626B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#60626B" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8E9ED',
                  borderRadius: '8px',
                  direction: 'rtl',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Clients */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-bold text-ui-text mb-6">לקוחות מובילים</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E9ED" />
                <XAxis type="number" stroke="#60626B" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" width={120} stroke="#60626B" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E9ED',
                    borderRadius: '8px',
                    direction: 'rtl',
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Popular Services */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-bold text-ui-text mb-6">שירותים פופולריים</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {popularServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E9ED',
                    borderRadius: '8px',
                    direction: 'rtl',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
