import Link from 'next/link'
import { register } from '@/app/auth/actions'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-teal-600">StudyHub</span>
          </Link>
          <p className="text-gray-500 mt-2">Erstelle deinen kostenlosen Account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrieren</h1>

          <SuccessOrForm searchParams={searchParams} />
        </div>

        <p className="text-center text-gray-500 mt-6">
          Bereits registriert?{' '}
          <Link href="/login" className="text-teal-600 font-medium hover:text-teal-800">
            Einloggen
          </Link>
        </p>
      </div>
    </main>
  )
}

async function SuccessOrForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams

  if (params.success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Fast geschafft!</h2>
        <p className="text-gray-600">
          Wir haben dir eine Bestätigungs-E-Mail geschickt. Klick auf den Link darin
          um deinen Account zu aktivieren.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
        >
          Zum Login
        </Link>
      </div>
    )
  }

  return (
    <form action={register} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Benutzername
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="z.B. max_muster"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="deine@email.de"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mindestens 6 Zeichen"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      {params.error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {params.error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors mt-2"
      >
        Kostenlosen Account erstellen
      </button>

      <p className="text-xs text-gray-400 text-center">
        Mit der Registrierung stimmst du zu, die Community-Regeln einzuhalten.
      </p>
    </form>
  )
}
