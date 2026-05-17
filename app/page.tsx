import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-teal-600">StudyHub</span>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">HS Koblenz</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-teal-600 font-medium hover:text-teal-800 transition-colors"
          >
            Einloggen
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-block bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          🎓 Inoffiziell. Ehrlich. Von Studierenden für Studierende.
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Die Wahrheit über deine<br />
          <span className="text-teal-600">Module an der HS Koblenz</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Echte Lernzeiten, echte Noten, echte Erfahrungen — geteilt von Studierenden,
          die das Modul schon gemacht haben. Kein Marketing, keine Hochglanzbroschüren.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg border-2 border-teal-200 hover:border-teal-400 transition-colors"
          >
            Einloggen
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Modul-Statistiken</h3>
            <p className="text-gray-600">
              Durchschnittliche Lernzeit, Notenspiegel und Durchfallquote —
              anonym eingereicht von echten Studierenden.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live-Chat</h3>
            <p className="text-gray-600">
              Stell Fragen, tausch dich aus, bekomm Antworten in Echtzeit —
              direkt im jeweiligen Modul-Chat.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lernmaterialien</h3>
            <p className="text-gray-600">
              Zusammenfassungen, Altklausuren, Skripte — kuratiert von der Community,
              immer aktuell gehalten.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
