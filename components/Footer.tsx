export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-gray-600">
          <p className="text-sm mb-1">
            מבוסס על תקנות הנוטריונים (שכר שירותים), תשל״ט-1978
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} NotaryCalc Pro • כל הזכויות שמורות • <strong>חיים פרץ</strong> • משרד עו״ד <strong>גיא הרשקוביץ</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
