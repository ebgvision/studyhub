import Link from 'next/link'
import { redirect } from 'next/navigation'
import { login } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import SubmitButton from './SubmitButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const params = await searchParams

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-teal-600">StudyHub</span>
          </Link>
          <p className="text-gray-500 mt-2">Willkommen zurück 👋</p>
        </div>

        {/* Erfolg nach Verifizierung */}
        {params.verified && (
          <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-xl text-sm mb-4 text-center">
            ✅ E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.
          </div>
        )}

        {/* Fehlermeldung */}
        {params.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center">
            {params.error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Einloggen</h1>

          <form action={login} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <SubmitButton label="Einloggen" />
          </form>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Noch kein Account?{' '}
          <Link href="/register" className="text-teal-600 font-medium hover:text-teal-800">
            Kostenlos registrieren
          </Link>
        </p>
      </div>
    </main>
  )
}
