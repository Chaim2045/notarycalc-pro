'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import { logger } from '@/lib/logger'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    officeName: '',
    phone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      setLoading(false)
      return
    }

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            office_name: formData.officeName,
            phone: formData.phone
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Profile is created automatically by trigger, just update additional fields
        await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            office_name: formData.officeName,
            phone: formData.phone
          })
          .eq('id', data.user.id)

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהרשמה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ההרשמה הושלמה בהצלחה!</h2>
          <p className="text-gray-600 mb-4">מעביר אותך ל-Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">NotaryCalc Pro</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">הרשמה</h1>
        <p className="text-gray-600 mb-8 text-center">התחל 14 יום ניסיון חינם</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם מלא *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="יוסי כהן"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="לפחות 6 תווים"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימות סיסמה *
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="הזן סיסמה שוב"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם משרד
            </label>
            <input
              type="text"
              name="officeName"
              value={formData.officeName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="משרד עו״ד כהן"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טלפון
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'נרשם...' : 'הרשמה - 14 יום חינם'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          כבר יש לך חשבון?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            התחבר
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 mt-4">
          ללא כרטיס אשראי • ללא התחייבות • ביטול בכל עת
        </p>
      </div>

      <Footer />
    </div>
  )
}
