'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'נשלח לך מייל עם קישור לאיפוס סיסמה'
      })
      setEmail('')
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'אירעה שגיאה, נסה שוב'
      })
    } finally {
      setLoading(false)
    }
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">שכחת סיסמה?</h1>
        <p className="text-gray-600 mb-8 text-center">נשלח לך קישור לאיפוס סיסמה למייל</p>

        {message && (
          <div className={`border px-4 py-3 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
          <Link
            href="/auth/login"
            className="block text-sm text-blue-600 hover:text-blue-700"
          >
            חזרה להתחברות
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
