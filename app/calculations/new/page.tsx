'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  RATES,
  VAT_RATE,
  SERVICE_TYPES,
  getTranslationBreakdown,
  getPhotocopyBreakdown,
  calculateTranslationCost,
  calculateHalfTranslationCost,
  calculatePhotocopyCoast,
} from '@/lib/rates'

interface Service {
  id: number
  type: string
  subType?: string
  quantity: number
  copies: number
  pages: number
  description: string
  basePrice: number
  includeTranslation: boolean
  translationWords: number
}

// Sub-type constants
const SIGNATURE_SUB_TYPES = [
  { value: 'first', label: 'חותם ראשון', price: 193 },
  { value: 'additional', label: 'חותם נוסף', price: 75 },
  { value: 'authorized', label: 'אישור מוסמך', price: 75 },
  { value: 'copy', label: 'העתק מאושר', price: 75 },
]

const WILL_SUB_TYPES = [
  { value: 'first', label: 'צוואה - מסמך ראשון', price: 286 },
  { value: 'additional', label: 'צוואה - מסמך נוסף', price: 143 },
  { value: 'multipleCopy', label: 'העתק נוסף', price: 86 },
]

const AFFIDAVIT_SUB_TYPES = [
  { value: 'first', label: 'תצהיר - מסמך ראשון', price: 195 },
  { value: 'additional', label: 'תצהיר - מסמך נוסף', price: 78 },
  { value: 'multipleCopy', label: 'העתק מאושר', price: 75 },
]

const COMMERCIAL_DOC_SUB_TYPES = [
  { value: 'under80700', label: 'עד 80,700 ₪', price: 1244 },
  { value: 'over80700', label: 'מעל 80,700 ₪', price: 2667 },
]

const CANCELLATION_SUB_TYPES = [
  { value: 'registration', label: 'רישום ביטול', price: 204 },
  { value: 'certifiedCopy', label: 'העתק מאושר', price: 72 },
  { value: 'additionalCopy', label: 'העתק נוסף', price: 72 },
]

// Service Card Component
function ServiceCard({
  service,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  service: Service
  index: number
  onUpdate: (id: number, field: string, value: any) => void
  onRemove: (id: number) => void
  canRemove: boolean
}) {
  const getSubTypeOptions = useCallback((type: string) => {
    switch (type) {
      case 'signature':
        return SIGNATURE_SUB_TYPES
      case 'will':
        return WILL_SUB_TYPES
      case 'affidavit':
        return AFFIDAVIT_SUB_TYPES
      case 'commercialDoc':
        return COMMERCIAL_DOC_SUB_TYPES
      case 'cancellation':
        return CANCELLATION_SUB_TYPES
      default:
        return []
    }
  }, [])

  const needsCopies = useCallback((type: string) => {
    return ['translation', 'photocopy', 'will', 'affidavit', 'prenup'].includes(type)
  }, [])

  const needsPages = useCallback((type: string) => {
    return type === 'photocopy'
  }, [])

  const serviceCost = useMemo(() => {
    if (service.type === 'translation') {
      const base = calculateTranslationCost(service.translationWords) * service.quantity
      const copies = service.copies > 1 ? (service.copies - 1) * RATES.translation.multipleCopy : 0
      return (base + copies).toFixed(2)
    } else if (service.type === 'photocopy') {
      return (calculatePhotocopyCoast(service.pages, service.copies) * service.quantity).toFixed(2)
    } else {
      let cost = service.basePrice * service.quantity
      if (service.includeTranslation && service.translationWords > 0) {
        cost += calculateHalfTranslationCost(service.translationWords) * service.quantity
      }
      if (needsCopies(service.type) && service.copies > 1) {
        const copyRate =
          service.type === 'will'
            ? RATES.will.multipleCopy
            : service.type === 'affidavit'
            ? RATES.affidavit.multipleCopy
            : service.type === 'prenup'
            ? RATES.prenup.multipleCopy
            : 0
        cost += (service.copies - 1) * copyRate * service.quantity
      }
      return cost.toFixed(2)
    }
  }, [service, needsCopies])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-900">שירות #{index + 1}</span>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(service.id)}
            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            aria-label="הסר שירות"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`service-type-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
            סוג שירות
          </label>
          <select
            id={`service-type-${service.id}`}
            value={service.type}
            onChange={(e) => onUpdate(service.id, 'type', e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {getSubTypeOptions(service.type).length > 0 && (
          <div>
            <label htmlFor={`service-subtype-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
              פירוט
            </label>
            <select
              id={`service-subtype-${service.id}`}
              value={service.subType}
              onChange={(e) => onUpdate(service.id, 'subType', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {getSubTypeOptions(service.type).map((subType) => (
                <option key={subType.value} value={subType.value}>
                  {subType.label} (₪{subType.price})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor={`service-quantity-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
            כמות
          </label>
          <input
            id={`service-quantity-${service.id}`}
            type="number"
            min="1"
            value={service.quantity}
            onChange={(e) => onUpdate(service.id, 'quantity', parseInt(e.target.value) || 1)}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {needsCopies(service.type) && (
          <div>
            <label htmlFor={`service-copies-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
              מספר עותקים
              <span className="text-xs text-blue-600 mr-2">(עותק נוסף = מחיר מופחת)</span>
            </label>
            <input
              id={`service-copies-${service.id}`}
              type="number"
              min="1"
              value={service.copies || 1}
              onChange={(e) => onUpdate(service.id, 'copies', parseInt(e.target.value) || 1)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {needsPages(service.type) && (
          <div>
            <label htmlFor={`service-pages-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
              מספר עמודים
            </label>
            <input
              id={`service-pages-${service.id}`}
              type="number"
              min="1"
              value={service.pages || 1}
              onChange={(e) => onUpdate(service.id, 'pages', parseInt(e.target.value) || 1)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {service.type === 'translation' && (
          <div className="sm:col-span-2">
            <label htmlFor={`service-words-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
              מספר מילים
              <div className="text-xs text-gray-500 mt-1">עד 100: ₪245 | 100-1000: ₪193/100 | מעל 1000: ₪96/100</div>
            </label>
            <input
              id={`service-words-${service.id}`}
              type="number"
              min="0"
              value={service.translationWords}
              onChange={(e) => onUpdate(service.id, 'translationWords', parseInt(e.target.value) || 0)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="הזן מספר מילים"
            />
          </div>
        )}

        {['will', 'affidavit', 'prenup'].includes(service.type) && (
          <>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.includeTranslation}
                  onChange={(e) => onUpdate(service.id, 'includeTranslation', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">כולל תרגום (מחצית מעלות תרגום מלא)</span>
              </label>
            </div>
            {service.includeTranslation && (
              <div className="sm:col-span-2">
                <label htmlFor={`service-translation-words-${service.id}`} className="block text-sm font-medium mb-2 text-gray-700">
                  מספר מילים בתרגום
                </label>
                <input
                  id={`service-translation-words-${service.id}`}
                  type="number"
                  min="0"
                  value={service.translationWords}
                  onChange={(e) => onUpdate(service.id, 'translationWords', parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="הזן מספר מילים"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Breakdown */}
      <CalculationBreakdown service={service} />

      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">{service.description}</span>
          <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">₪{serviceCost}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Calculation Breakdown Component
function CalculationBreakdown({ service }: { service: Service }) {
  if (service.type === 'translation' && service.translationWords > 0) {
    const breakdown = getTranslationBreakdown(service.translationWords)
    const copyCharge = service.copies > 1 ? (service.copies - 1) * RATES.translation.multipleCopy : 0

    return (
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          פירוט חישוב מדויק
        </div>
        {breakdown.lines.map((line, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <span className="text-gray-700">{line.text}</span>
            <span className="font-mono text-gray-600">
              {line.calc} = ₪{line.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {service.copies > 1 && (
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">{service.copies - 1} עותקים נוספים</span>
            <span className="font-mono text-gray-600">
              {service.copies - 1} × ₪75 = ₪{copyCharge.toFixed(2)}
            </span>
          </div>
        )}
        {service.quantity > 1 && (
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">כפול כמות</span>
            <span className="font-mono text-gray-600">× {service.quantity}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-blue-900 mt-2 pt-2 border-t border-blue-300">
          <span>סה״כ:</span>
          <span className="font-mono text-lg">₪{((breakdown.total + copyCharge) * service.quantity).toFixed(2)}</span>
        </div>
      </div>
    )
  }

  if (service.type === 'photocopy' && service.pages > 0) {
    const breakdown = getPhotocopyBreakdown(service.pages, service.copies)

    return (
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          פירוט חישוב מדויק
        </div>
        {breakdown.lines.map((line, idx) => (
          <div key={idx} className="mb-2">
            <div className="font-semibold text-sm text-gray-900">{line.text}:</div>
            {line.subLines &&
              line.subLines.map((sub, subIdx) => (
                <div key={subIdx} className="flex justify-between mr-4 text-sm py-1">
                  <span className="text-gray-700">{sub.text}</span>
                  <span className="font-mono text-gray-600">
                    {sub.calc} = ₪{sub.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            <div className="flex justify-between font-semibold mr-4 mt-1 text-sm">
              <span className="text-gray-900">סיכום עותק:</span>
              <span className="font-mono text-gray-900">₪{line.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
        {service.quantity > 1 && (
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">כפול כמות</span>
            <span className="font-mono text-gray-600">× {service.quantity}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-blue-900 mt-2 pt-2 border-t border-blue-300">
          <span>סה״כ כל העותקים:</span>
          <span className="font-mono text-lg">₪{(breakdown.total * service.quantity).toFixed(2)}</span>
        </div>
      </div>
    )
  }

  if (['will', 'affidavit', 'prenup'].includes(service.type)) {
    const baseCost = service.basePrice * service.quantity
    const copyRate =
      service.type === 'will'
        ? RATES.will.multipleCopy
        : service.type === 'affidavit'
        ? RATES.affidavit.multipleCopy
        : service.type === 'prenup'
        ? RATES.prenup.multipleCopy
        : 0
    const copyCharge = service.copies > 1 && copyRate > 0 ? (service.copies - 1) * copyRate * service.quantity : 0
    const translationCharge =
      service.includeTranslation && service.translationWords > 0
        ? calculateHalfTranslationCost(service.translationWords) * service.quantity
        : 0

    if (copyCharge > 0 || translationCharge > 0) {
      const translationBreakdown =
        service.includeTranslation && service.translationWords > 0 ? getTranslationBreakdown(service.translationWords) : null

      return (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            פירוט חישוב מדויק
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-700">{service.description}</span>
            <span className="font-mono text-gray-600">
              {service.quantity} × ₪{service.basePrice} = ₪{baseCost.toFixed(2)}
            </span>
          </div>
          {copyCharge > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-700">{service.copies - 1} עותקים נוספים (מחיר מופחת)</span>
              <span className="font-mono text-gray-600">
                {service.copies - 1} × ₪{copyRate} × {service.quantity} = ₪{copyCharge.toFixed(2)}
              </span>
            </div>
          )}
          {translationCharge > 0 && (
            <>
              <div className="font-semibold mt-2 mb-1 text-sm text-gray-900">תרגום (מחצית מחיר):</div>
              {translationBreakdown &&
                translationBreakdown.lines.map((line, idx) => (
                  <div key={idx} className="flex justify-between mr-4 text-sm py-1">
                    <span className="text-gray-700">{line.text}</span>
                    <span className="font-mono text-gray-600">
                      {line.calc} = ₪{line.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between mr-4 text-sm py-1">
                <span className="text-gray-700">מחצית מחיר התרגום</span>
                <span className="font-mono text-gray-600">
                  ₪{translationBreakdown?.total.toFixed(2)} ÷ 2 = ₪{((translationBreakdown?.total || 0) / 2).toFixed(2)}
                </span>
              </div>
              {service.quantity > 1 && (
                <div className="flex justify-between mr-4 text-sm py-1">
                  <span className="text-gray-700">כפול כמות</span>
                  <span className="font-mono text-gray-600">× {service.quantity} = ₪{translationCharge.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between font-bold text-blue-900 mt-2 pt-2 border-t border-blue-300">
            <span>סה״כ:</span>
            <span className="font-mono text-lg">₪{(baseCost + copyCharge + translationCharge).toFixed(2)}</span>
          </div>
        </div>
      )
    }
  }

  return null
}

// Main Calculator Component
export default function NewCalculationPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      type: 'signature',
      subType: 'first',
      quantity: 1,
      copies: 1,
      pages: 1,
      description: 'אימות חתימה - חותם ראשון',
      basePrice: 193,
      includeTranslation: false,
      translationWords: 0,
    },
  ])

  const addService = useCallback(() => {
    setServices((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'signature',
        subType: 'first',
        quantity: 1,
        copies: 1,
        pages: 1,
        description: 'אימות חתימה - חותם ראשון',
        basePrice: 193,
        includeTranslation: false,
        translationWords: 0,
      },
    ])
  }, [])

  const removeService = useCallback((id: number) => {
    setServices((prev) => {
      if (prev.length > 1) {
        return prev.filter((s) => s.id !== id)
      }
      return prev
    })
  }, [])

  const updateService = useCallback((id: number, field: string, value: any) => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value }

          if (field === 'type' || field === 'subType') {
            const type = field === 'type' ? value : service.type
            const subType = field === 'subType' ? value : service.subType

            if (type === 'translation') {
              updated.description = 'אישור נכונות תרגום'
              updated.basePrice = 0
              updated.includeTranslation = false
              updated.copies = updated.copies || 1
            } else if (type === 'photocopy') {
              updated.basePrice = 0
              updated.description = 'אישור העתק צילומי'
              updated.pages = updated.pages || 1
              updated.copies = updated.copies || 1
            } else if (type === 'signature') {
              const subTypeObj = SIGNATURE_SUB_TYPES.find((st) => st.value === subType)
              updated.basePrice = subTypeObj?.price || 193
              updated.description = 'אימות חתימה - ' + (subTypeObj?.label || '')
            } else if (type === 'will') {
              const subTypeObj = WILL_SUB_TYPES.find((st) => st.value === subType)
              updated.basePrice = subTypeObj?.price || 286
              updated.description = 'אישור צוואה - ' + (subTypeObj?.label || '')
              updated.copies = updated.copies || 1
            } else if (type === 'affidavit') {
              const subTypeObj = AFFIDAVIT_SUB_TYPES.find((st) => st.value === subType)
              updated.basePrice = subTypeObj?.price || 195
              updated.description = 'תצהיר - ' + (subTypeObj?.label || '')
              updated.copies = updated.copies || 1
            } else if (type === 'commercialDoc') {
              const subTypeObj = COMMERCIAL_DOC_SUB_TYPES.find((st) => st.value === subType)
              updated.basePrice = subTypeObj?.price || 1244
              updated.description = 'העדת מסמך סחיר - ' + (subTypeObj?.label || '')
            } else if (type === 'cancellation') {
              const subTypeObj = CANCELLATION_SUB_TYPES.find((st) => st.value === subType)
              updated.basePrice = subTypeObj?.price || 204
              updated.description = 'ביטול ייפוי כוח - ' + (subTypeObj?.label || '')
            } else if (type === 'prenup') {
              updated.basePrice = RATES.prenup.first
              updated.description = 'אימות הסכם ממון'
              updated.copies = updated.copies || 1
            } else if (type === 'alive') {
              updated.basePrice = RATES.alive
              updated.description = 'אישור שפלוני בחיים'
            } else if (type === 'other') {
              updated.basePrice = RATES.other
              updated.description = 'פעולה אחרת'
            }
          }

          return updated
        }
        return service
      })
    )
  }, [])

  const calculations = useMemo(() => {
    let subtotal = 0

    services.forEach((service) => {
      let serviceCost = 0

      if (service.type === 'translation') {
        const singleTranslation = calculateTranslationCost(service.translationWords)
        serviceCost = singleTranslation * service.quantity
        if (service.copies > 1) {
          serviceCost += (service.copies - 1) * RATES.translation.multipleCopy
        }
      } else if (service.type === 'photocopy') {
        serviceCost = calculatePhotocopyCoast(service.pages, service.copies) * service.quantity
      } else if (service.type === 'will') {
        serviceCost = service.basePrice * service.quantity
        if (service.copies > 1) {
          serviceCost += (service.copies - 1) * RATES.will.multipleCopy * service.quantity
        }
        if (service.includeTranslation && service.translationWords > 0) {
          serviceCost += calculateHalfTranslationCost(service.translationWords) * service.quantity
        }
      } else if (service.type === 'affidavit') {
        serviceCost = service.basePrice * service.quantity
        if (service.copies > 1) {
          serviceCost += (service.copies - 1) * RATES.affidavit.multipleCopy * service.quantity
        }
        if (service.includeTranslation && service.translationWords > 0) {
          serviceCost += calculateHalfTranslationCost(service.translationWords) * service.quantity
        }
      } else if (service.type === 'prenup') {
        serviceCost = service.basePrice * service.quantity
        if (service.copies > 1) {
          serviceCost += (service.copies - 1) * RATES.prenup.multipleCopy * service.quantity
        }
        if (service.includeTranslation && service.translationWords > 0) {
          serviceCost += calculateHalfTranslationCost(service.translationWords) * service.quantity
        }
      } else {
        serviceCost = service.basePrice * service.quantity
      }

      subtotal += serviceCost
    })

    const vat = subtotal * VAT_RATE
    const total = subtotal + vat

    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2),
    }
  }, [services])

  const handleSave = useCallback(() => {
    alert('החישוב נשמר בהצלחה!')
  }, [])

  const handleExportPDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">חישוב חדש</h1>
                <p className="text-sm text-gray-600">מערכת חישוב תעריפי נוטריון</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Services Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  שירותים
                </h2>
                <button
                  onClick={addService}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  הוסף שירות
                </button>
              </div>

              <div className="space-y-4">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    onUpdate={updateService}
                    onRemove={removeService}
                    canRemove={services.length > 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">סיכום חישוב</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">סכום ביניים</span>
                  <span className="font-mono text-lg font-semibold text-gray-900">₪{calculations.subtotal}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">מע״מ (18%)</span>
                  <span className="font-mono text-lg font-semibold text-gray-900">₪{calculations.vat}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-900">סה״כ לתשלום</span>
                  <span className="font-mono text-2xl font-bold text-blue-600">₪{calculations.total}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleSave}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  שמור חישוב
                </button>

                <button
                  onClick={handleExportPDF}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  ייצוא ל-PDF
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  מבוסס על תקנות הנוטריונים (שכר שירותים), תשל״ט-1978
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p className="text-sm mb-1">מערכת חישוב תעריפי נוטריון מקצועית</p>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} NotaryCalc Pro • כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  )
}
