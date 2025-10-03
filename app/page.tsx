import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                NotaryCalc Pro
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                התחבר
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                הרשמה
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            מערכת חישוב תעריפי נוטריון
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            מקצועית ומהירה לעורכי דין ונוטריונים
          </p>

          <div className="flex gap-3 justify-center mb-6">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              התחל 14 יום חינם
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
            >
              התחבר
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            ללא כרטיס אשראי • ללא התחייבות
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              חישובים בלתי מוגבלים
            </h3>
            <p className="text-sm text-gray-600">
              שמירה אוטומטית בענן
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              ייצוא מקצועי
            </h3>
            <p className="text-sm text-gray-600">
              PDF מעוצב עם לוגו המשרד
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              ניהול לקוחות
            </h3>
            <p className="text-sm text-gray-600">
              היסטוריית חישובים במקום אחד
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-16 max-w-sm mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-600">
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">39</span>
                <span className="text-lg font-semibold text-gray-600">₪</span>
                <span className="text-sm text-gray-500">/חודש</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-right">
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">חישובים בלתי מוגבלים</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">ייצוא PDF + ניהול לקוחות</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all text-center"
            >
              התחל עכשיו - 14 יום חינם
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p className="text-sm mb-1">מבוסס על תקנות הנוטריונים (שכר שירותים), תשל״ט-1978</p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} NotaryCalc Pro • כל הזכויות שמורות לחיים פרץ • משרד עו״ד גיא הרשקוביץ
          </p>
        </div>
      </footer>
    </div>
  )
}
