'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Calculation, Profile } from '@/lib/supabase'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { DataTable, Column, SortDir } from '@/components/data/DataTable'
import { Toolbar } from '@/components/data/Toolbar'
import { Pagination } from '@/components/data/Pagination'
import { toast } from '@/lib/toast'
import { exportToCSV } from '@/lib/csv-export'
import { generateCalculationPDF, downloadPDF } from '@/lib/pdf-export'

export default function CalculationsHistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  // Advanced filters
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Sorting state
  const [sort, setSort] = useState<{ columnId: string; dir: SortDir } | null>(null)

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
    if (!confirm(t('confirmDelete'))) return

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCalculations(prev => prev.filter(c => c.id !== id))
      toast.success('נמחק בהצלחה')
    } catch (error) {
      logger.error('Error deleting:', error)
      toast.error(t('deleteError') || 'שגיאה במחיקה')
    }
  }

  function handleExportCSV() {
    try {
      exportToCSV(
        filteredCalculations,
        `calculations-${new Date().toISOString().split('T')[0]}`,
        [
          { key: 'client_name', header: 'לקוח' },
          { key: 'total', header: 'סכום' },
          { key: 'created_at', header: 'תאריך' },
          { key: 'notes', header: 'הערות' },
        ]
      )
      toast.success('הקובץ יוצא בהצלחה')
    } catch (error) {
      toast.error('שגיאה בייצוא הקובץ')
    }
  }

  async function handleExportPDF(calculation: Calculation) {
    if (!profile) {
      toast.error('לא נמצא פרופיל משתמש')
      return
    }

    try {
      toast.promise(
        (async () => {
          const pdfBlob = await generateCalculationPDF({
            calculation,
            profile,
            language: 'he',
          })
          downloadPDF(pdfBlob, `calculation-${calculation.id.slice(0, 8)}.pdf`)
        })(),
        {
          loading: 'מייצר PDF...',
          success: 'PDF הורד בהצלחה!',
          error: 'שגיאה בייצור PDF',
        }
      )
    } catch (error) {
      logger.error('PDF export error:', error)
    }
  }

  // Client-side filtering
  const filteredCalculations = useMemo(() => {
    return calculations.filter(calc => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        (calc.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (calc.notes?.toLowerCase().includes(searchTerm.toLowerCase()))

      // Month filter (quick filter)
      const calcDate = new Date(calc.created_at)
      const now = new Date()

      let matchesMonth = true
      if (filterMonth !== 'all') {
        if (filterMonth === 'this-month') {
          matchesMonth = calcDate.getMonth() === now.getMonth() &&
            calcDate.getFullYear() === now.getFullYear()
        } else if (filterMonth === 'last-month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          matchesMonth = calcDate.getMonth() === lastMonth.getMonth() &&
            calcDate.getFullYear() === lastMonth.getFullYear()
        }
      }

      // Date range filter (advanced)
      let matchesDateRange = true
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        matchesDateRange = matchesDateRange && calcDate >= fromDate
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        matchesDateRange = matchesDateRange && calcDate <= toDate
      }

      // Amount range filter
      let matchesAmount = true
      if (minAmount && calc.total < parseFloat(minAmount)) {
        matchesAmount = false
      }
      if (maxAmount && calc.total > parseFloat(maxAmount)) {
        matchesAmount = false
      }

      return matchesSearch && matchesMonth && matchesDateRange && matchesAmount
    })
  }, [calculations, searchTerm, filterMonth, dateFrom, dateTo, minAmount, maxAmount])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return filteredCalculations.slice(startIndex, startIndex + pageSize)
  }, [filteredCalculations, page, pageSize])

  // Statistics
  const stats = useMemo(() => {
    return {
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
  }, [calculations])

  // DataTable columns
  const columns: Column<Calculation>[] = [
    {
      id: 'client_name',
      header: 'לקוח',
      accessor: 'client_name',
      sortable: true,
      renderCell: (row) => (
        <div>
          <div className="font-medium text-ui-text">
            {row.client_name || t('noClientName')}
          </div>
          {row.notes && (
            <div className="text-xs text-ui-text-muted mt-0.5">{row.notes}</div>
          )}
        </div>
      ),
    },
    {
      id: 'services',
      header: t('services'),
      align: 'center',
      renderCell: (row) => {
        try {
          const services = typeof row.services === 'string'
            ? JSON.parse(row.services)
            : row.services
          const count = Array.isArray(services) ? services.length : 0
          return <Badge variant="neutral">{count} {t('services')}</Badge>
        } catch {
          return <Badge variant="neutral">0 {t('services')}</Badge>
        }
      },
    },
    {
      id: 'total',
      header: 'סכום',
      accessor: 'total',
      sortable: true,
      align: 'end',
      renderCell: (row) => (
        <div className="font-semibold text-ui-text">
          ₪{row.total.toLocaleString()}
        </div>
      ),
    },
    {
      id: 'created_at',
      header: t('date'),
      accessor: 'created_at',
      sortable: true,
      renderCell: (row) => (
        <div className="text-sm text-ui-text-secondary">
          {new Date(row.created_at).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('actions'),
      align: 'end',
      renderCell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExportPDF(row)}
            title="ייצא ל-PDF"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/calculations/${row.id}`)}
          >
            {t('view')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCalculation(row.id)}
            className="text-error hover:bg-red-50"
          >
            {t('delete')}
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ui-text-secondary">{t('loadingHistory')}</p>
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
                <h1 className="text-xl font-bold text-ui-text">{t('calculationHistory')}</h1>
                {profile?.office_name && (
                  <p className="text-sm text-ui-text-secondary">{profile.office_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                ← {t('back')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('totalCalculations')}</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">{stats.total}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('thisMonth')}</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">{stats.thisMonth}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('totalRevenue')}</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">₪{stats.totalRevenue.toLocaleString()}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">{t('monthlyRevenue')}</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-ui-text">₪{stats.thisMonthRevenue.toLocaleString()}</p>
          </Card>
        </div>

        {/* Data Table with Toolbar */}
        <Card padding="none" className="overflow-hidden">
          <Toolbar
            searchPlaceholder={t('searchPlaceholder')}
            onSearchChange={setSearchTerm}
            statusFilter={{
              options: [
                { value: 'this-month', label: t('thisMonth') },
                { value: 'last-month', label: t('lastMonth') },
              ],
              value: filterMonth === 'all' ? undefined : filterMonth,
              onChange: (v) => setFilterMonth(v || 'all'),
            }}
            onExportCSV={handleExportCSV}
            onExportPDF={() => toast.info('בחר חישוב ספציפי לייצוא PDF')}
            primaryAction={{
              label: t('newCalculation'),
              onClick: () => router.push('/calculations/new'),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
            }}
          />

          {/* Advanced Filters */}
          <div className="border-t border-ui-border bg-ui-bg px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-ui-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-sm font-medium text-ui-text-secondary">פילטרים מתקדמים</h3>
              {(dateFrom || dateTo || minAmount || maxAmount) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setMinAmount('')
                    setMaxAmount('')
                  }}
                  className="text-brand-600 hover:text-brand-700"
                >
                  נקה פילטרים
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-ui-text-secondary mb-1">מתאריך</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ui-text-secondary mb-1">עד תאריך</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ui-text-secondary mb-1">סכום מינימלי (₪)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ui-text-secondary mb-1">סכום מקסימלי (₪)</label>
                <Input
                  type="number"
                  placeholder="999999"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  inputSize="sm"
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedData}
            keyField="id"
            sort={sort}
            onSortChange={setSort}
            loading={loading}
            emptyState={{
              title: t('noCalculations'),
              description: searchTerm ? t('noSearchResults') : t('notDoneYet'),
              icon: (
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              ),
            }}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            totalRows={filteredCalculations.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1) // Reset to first page
            }}
          />
        </Card>
      </main>

      <Footer />
    </div>
  )
}
