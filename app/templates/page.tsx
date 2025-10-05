'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { toast } from '@/lib/toast'

interface Template {
  id: string
  user_id: string
  name: string
  description: string | null
  services: any[]
  created_at: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    services: [] as any[],
  })

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

      // Load templates
      const { data: templatesData, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (templatesData) setTemplates(templatesData)
    } catch (error) {
      logger.error('Error loading templates:', error)
      toast.error('שגיאה בטעינת תבניות')
    } finally {
      setLoading(false)
    }
  }

  async function createTemplate() {
    if (!newTemplate.name.trim()) {
      toast.error('נא להזין שם תבנית')
      return
    }

    if (newTemplate.services.length === 0) {
      toast.error('נא להוסיף לפחות שירות אחד')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .insert({
          user_id: user.id,
          name: newTemplate.name,
          description: newTemplate.description,
          services: newTemplate.services,
        })
        .select()
        .single()

      if (error) throw error

      setTemplates([data, ...templates])
      setShowCreateModal(false)
      setNewTemplate({ name: '', description: '', services: [] })
      toast.success('תבנית נוצרה בהצלחה!')
    } catch (error) {
      logger.error('Error creating template:', error)
      toast.error('שגיאה ביצירת תבנית')
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('האם למחוק תבנית זו?')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.filter((t) => t.id !== id))
      toast.success('תבנית נמחקה')
    } catch (error) {
      logger.error('Error deleting template:', error)
      toast.error('שגיאה במחיקת תבנית')
    }
  }

  function addServiceToTemplate() {
    setNewTemplate({
      ...newTemplate,
      services: [
        ...newTemplate.services,
        {
          name: '',
          description: '',
          price: 0,
          quantity: 1,
        },
      ],
    })
  }

  function updateService(index: number, field: string, value: any) {
    const updatedServices = [...newTemplate.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setNewTemplate({ ...newTemplate, services: updatedServices })
  }

  function removeService(index: number) {
    setNewTemplate({
      ...newTemplate,
      services: newTemplate.services.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ui-text-secondary">טוען תבניות...</p>
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
                <h1 className="text-xl font-bold text-ui-text">תבניות שירותים</h1>
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
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ui-text">התבניות שלי</h2>
            <p className="text-sm text-ui-text-secondary mt-1">
              צור תבניות לשירותים נפוצים לחיסכון בזמן
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            תבנית חדשה
          </Button>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ui-text mb-2">אין תבניות עדיין</h3>
            <p className="text-sm text-ui-text-secondary mb-6">צור את התבנית הראשונה שלך כדי להתחיל</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              צור תבנית
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const servicesArray = Array.isArray(template.services) ? template.services : []
              const totalServices = servicesArray.length
              const totalValue = servicesArray.reduce(
                (sum, s) => sum + (s.price || 0) * (s.quantity || 1),
                0
              )

              return (
                <Card key={template.id} variant="elevated" padding="md" interactive>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-ui-text mb-1">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-ui-text-secondary">{template.description}</p>
                      )}
                    </div>
                    <Badge variant="neutral">{totalServices} שירותים</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-brand-600">₪{totalValue.toLocaleString()}</div>
                    <div className="text-xs text-ui-text-muted">סה"כ משוער</div>
                  </div>

                  <div className="border-t border-ui-border pt-3 mb-3">
                    <div className="text-xs text-ui-text-muted mb-2">שירותים:</div>
                    <div className="space-y-1">
                      {servicesArray.slice(0, 3).map((service, idx) => (
                        <div key={idx} className="text-sm text-ui-text flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-brand-600"></div>
                          <span className="truncate">{service.name || service.description}</span>
                        </div>
                      ))}
                      {totalServices > 3 && (
                        <div className="text-xs text-ui-text-muted">+{totalServices - 3} נוספים...</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Store template in localStorage and navigate
                        localStorage.setItem('selectedTemplate', JSON.stringify(template))
                        router.push('/calculations/new')
                      }}
                    >
                      השתמש
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-error hover:bg-red-50"
                    >
                      מחק
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ui-text">תבנית חדשה</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-ui-text-muted hover:text-ui-text">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">שם התבנית *</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="לדוגמה: רכישת דירה - מסמכים בסיסיים"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text mb-2">תיאור (אופציונלי)</label>
                <Input
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="תיאור קצר של התבנית"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-ui-text">שירותים</label>
                  <Button variant="secondary" size="sm" onClick={addServiceToTemplate}>
                    + הוסף שירות
                  </Button>
                </div>

                <div className="space-y-3">
                  {newTemplate.services.map((service, index) => (
                    <Card key={index} variant="bordered" padding="sm">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <Input
                          placeholder="שם השירות"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          inputSize="sm"
                        />
                        <Input
                          type="number"
                          placeholder="מחיר"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', Number(e.target.value))}
                          inputSize="sm"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Input
                          placeholder="תיאור (אופציונלי)"
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          inputSize="sm"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-error"
                        >
                          הסר
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={createTemplate} className="flex-1">
                צור תבנית
              </Button>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
