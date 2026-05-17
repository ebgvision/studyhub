import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import Link from 'next/link'
import ProgramAccordion from '../ProgramAccordion'
import StarButton from './StarButton'

export default async function ModuleSearchPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: programs } = await supabase
    .from('programs')
    .select('*, colleges(name, city)')
    .order('name')

  const { data: programModules } = await supabase
    .from('program_modules')
    .select('program_id, modules(id, name, slug, semester, module_type, code)')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-teal-600 transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-sm font-semibold text-gray-700">Module suchen</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Ausloggen
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Module suchen</h1>
          <p className="text-sm text-gray-400 mt-0.5">Wähle deinen Studiengang und klappe die Semester auf. Markiere Module mit ⭐ für schnellen Zugriff.</p>
        </div>

        {programs && programs.length > 0 ? (
          <ProgramAccordion
            programs={programs}
            programModules={(programModules ?? []) as any[]}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-500">Keine Daten gefunden. Führe das Seed-SQL in Supabase aus.</p>
          </div>
        )}
      </main>
    </div>
  )
}
