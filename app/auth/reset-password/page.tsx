'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'הסיסמאות לא תואמות'
      })
      return
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'הסיסמה חייבת להיות לפחות 6 תווים'
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'הסיסמה שונתה בהצלחה! מעביר אותך להתחברות...'
      })

      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">איפוס סיסמה</h1>
        <p className="text-gray-600 mb-8 text-center">הכנס סיסמה חדשה</p>

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
              סיסמה חדשה
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••"
              dir="ltr"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימות סיסמה
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••"
              dir="ltr"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'משנה סיסמה...' : 'שנה סיסמה'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            חזרה להתחברות
          </Link>
        </div>
      </div>
    </div>
  )
}
