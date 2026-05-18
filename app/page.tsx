import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white overflow-x-hidden">

      {/* Navigation */}
      <nav className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-teal-600">StudyHub</span>
          <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">HS Koblenz</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-3 py-2 text-sm text-teal-600 font-medium hover:text-teal-800 transition-colors"
          >
            Einloggen
          </Link>
          <Link
            href="/register"
            className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-16 text-center">
        <div className="inline-block bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-xs font-medium mb-5">
          🎓 Inoffiziell. Ehrlich. Von Studierenden für Studierende.
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Die Wahrheit über deine<br />
          <span className="text-teal-600">Module an der HS Koblenz</span>
        </h1>
        <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
          Echte Lernzeiten, echte Noten, echte Erfahrungen — geteilt von Studierenden,
          die das Modul schon gemacht haben. Kein Marketing, keine Hochglanzbroschüren.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/register"
            className="w-full max-w-xs px-6 py-3.5 bg-teal-600 text-white rounded-xl font-semibold text-base hover:bg-teal-700 transition-colors shadow-md shadow-teal-200 text-center"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/login"
            className="w-full max-w-xs px-6 py-3.5 bg-white text-teal-600 rounded-xl font-semibold text-base border-2 border-teal-200 hover:border-teal-400 transition-colors text-center"
          >
            Einloggen
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">📊</span>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Modul-Statistiken</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Durchschnittliche Lernzeit, Notenspiegel und Durchfallquote —
                anonym eingereicht von echten Studierenden.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">💬</span>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Live-Chat</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Stell Fragen, tausch dich aus, bekomm Antworten in Echtzeit —
                direkt im jeweiligen Modul-Chat.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">📁</span>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Lernmaterialien</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Zusammenfassungen, Altklausuren, Skripte — kuratiert von der Community,
                immer aktuell gehalten.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
