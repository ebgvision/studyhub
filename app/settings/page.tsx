export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_anonymous')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-teal-600 transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-sm text-gray-600 font-medium">Einstellungen</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Ausloggen
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-sm text-gray-500 mt-1">Verwalte dein Konto und deine Präferenzen.</p>
        </div>

        {/* Konto-Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Konto</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{profile?.username ?? 'Kein Benutzername'}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Einstellungsformular */}
        <SettingsForm
          userId={user.id}
          isAnonymous={profile?.is_anonymous ?? false}
        />
      </main>
    </div>
  )
}
