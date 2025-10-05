'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/data/DataTable'
import { Toolbar } from '@/components/data/Toolbar'
import { Pagination } from '@/components/data/Pagination'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { toast } from '@/lib/toast'

type Client = {
  id: string
  name: string
  id_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
  calculations_count?: number
  total_revenue?: number
}

export default function ClientsPage() {
  const { t } = useLanguage()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadClients()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    }
  }

  async function loadClients() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Load calculation counts for each client
      if (data) {
        const clientsWithStats = await Promise.all(
          data.map(async (client) => {
            const { count } = await supabase
              .from('calculations')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('client_name', client.name)

            const { data: calcs } = await supabase
              .from('calculations')
              .select('total')
              .eq('user_id', user.id)
              .eq('client_name', client.name)

            const totalRevenue = calcs?.reduce((sum, c) => sum + c.total, 0) || 0

            return {
              ...client,
              calculations_count: count || 0,
              total_revenue: totalRevenue,
            }
          })
        )
        setClients(clientsWithStats)
      }
    } catch (error) {
      logger.error('Error loading clients:', error)
      toast.error('שגיאה בטעינת לקוחות')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('נא להזין שם לקוח')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClient.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('לקוח עודכן בהצלחה')
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert({
            ...formData,
            user_id: user.id,
          })

        if (error) throw error
        toast.success('לקוח נוסף בהצלחה')
      }

      await loadClients()
      closeModal()
    } catch (error) {
      logger.error('Error saving client:', error)
      toast.error('שגיאה בשמירת לקוח')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('האם למחוק לקוח זה?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('לקוח נמחק בהצלחה')
      await loadClients()
    } catch (error) {
      logger.error('Error deleting client:', error)
      toast.error('שגיאה במחיקת לקוח')
    }
  }

  function openModal(client?: Client) {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        id_number: client.id_number || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || '',
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        id_number: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingClient(null)
    setFormData({
      name: '',
      id_number: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    })
  }

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clients, searchTerm])

  // Paginated clients
  const paginatedClients = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return filteredClients.slice(startIndex, startIndex + pageSize)
  }, [filteredClients, page, pageSize])

  // DataTable columns
  const columns: Column<Client>[] = [
    {
      id: 'name',
      header: 'שם לקוח',
      accessor: 'name',
      sortable: true,
      renderCell: (row) => (
        <div>
          <div className="font-medium text-ui-text">{row.name}</div>
          {row.email && (
            <div className="text-xs text-ui-text-muted">{row.email}</div>
          )}
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'טלפון',
      accessor: 'phone',
      renderCell: (row) => (
        <div className="text-sm text-ui-text-secondary">{row.phone || '—'}</div>
      ),
    },
    {
      id: 'id_number',
      header: 'ת.ז / ח.פ',
      accessor: 'id_number',
      renderCell: (row) => (
        <div className="text-sm text-ui-text-secondary font-mono">{row.id_number || '—'}</div>
      ),
    },
    {
      id: 'calculations',
      header: 'חישובים',
      align: 'center',
      renderCell: (row) => (
        <Badge variant={row.calculations_count && row.calculations_count > 0 ? 'success' : 'neutral'}>
          {row.calculations_count || 0}
        </Badge>
      ),
    },
    {
      id: 'revenue',
      header: 'הכנסות',
      align: 'end',
      renderCell: (row) => (
        <div className="font-semibold text-ui-text">
          ₪{(row.total_revenue || 0).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'created_at',
      header: 'נוצר בתאריך',
      accessor: 'created_at',
      sortable: true,
      renderCell: (row) => (
        <div className="text-sm text-ui-text-secondary">
          {new Date(row.created_at).toLocaleDateString('he-IL')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'פעולות',
      align: 'end',
      renderCell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openModal(row)}>
            ערוך
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-error hover:bg-red-50"
          >
            מחק
          </Button>
        </div>
      ),
    },
  ]

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ui-text-secondary">טוען לקוחות...</p>
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
                <h1 className="text-xl font-bold text-ui-text">ניהול לקוחות</h1>
                <p className="text-sm text-ui-text-secondary">נהל את רשימת הלקוחות שלך</p>
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
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">סה"כ לקוחות</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">{clients.length}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">לקוחות פעילים</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">
              {clients.filter(c => c.calculations_count && c.calculations_count > 0).length}
            </p>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-text-secondary">סה"כ הכנסות</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-ui-text">
              ₪{clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Data Table */}
        <Card padding="none" className="overflow-hidden">
          <Toolbar
            searchPlaceholder="חפש לקוח..."
            onSearchChange={setSearchTerm}
            primaryAction={{
              label: 'לקוח חדש',
              onClick: () => openModal(),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
            }}
          />

          <DataTable
            columns={columns}
            data={paginatedClients}
            keyField="id"
            loading={loading}
            emptyState={{
              title: 'אין לקוחות עדיין',
              description: searchTerm ? 'לא נמצאו תוצאות' : 'הוסף את הלקוח הראשון שלך',
              icon: (
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              ),
            }}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            totalRows={filteredClients.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </Card>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ui-text">
                {editingClient ? 'ערוך לקוח' : 'לקוח חדש'}
              </h2>
              <button
                onClick={closeModal}
                className="text-ui-text-muted hover:text-ui-text"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">שם לקוח *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="שם מלא"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ui-text mb-2">ת.ז / ח.פ</label>
                  <Input
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    placeholder="123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ui-text mb-2">טלפון</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="050-1234567"
                    type="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">אימייל</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@gmail.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">כתובת</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="רחוב 1, עיר"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">הערות</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="הערות נוספות..."
                  className="w-full px-4 py-3 bg-ui-surface border border-ui-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-ui-text placeholder:text-ui-text-muted"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" isLoading={loading} className="flex-1">
                  {editingClient ? 'עדכן לקוח' : 'צור לקוח'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  ביטול
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
