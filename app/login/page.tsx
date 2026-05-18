import Link from 'next/link'
import { redirect } from 'next/navigation'
import { login } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
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

            {/* Fehlermeldung */}
            <ErrorMessage searchParams={searchParams} />

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors mt-2"
            >
              Einloggen
            </button>
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

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  if (!params.error) return null

  return (
    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
      {params.error}
    </div>
  )
}
