import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import ProgramAccordion from './ProgramAccordion'

export default async function DashboardPage() {
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
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-teal-600">StudyHub</span>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">HS Koblenz</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Ausloggen
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Wähl deinen Studiengang und dein Modul</p>
        </div>

        {/* Campus Banner */}
        <div className="bg-teal-600 text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-teal-100 mb-1">Fachbereich</div>
            <div className="text-2xl font-bold">Wirtschafts- und Sozialwissenschaften</div>
            <div className="text-teal-200 text-sm mt-1">RheinAhrCampus Remagen · HS Koblenz</div>
          </div>
          <div className="text-5xl opacity-20">🎓</div>
        </div>

        {/* Studiengänge als Klapp-Ansicht */}
        {programs && programs.length > 0 ? (
          <ProgramAccordion
            programs={programs}
            programModules={programModules ?? []}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Noch keine Daten</h3>
            <p className="text-gray-500">Führe das Seed-SQL in Supabase aus.</p>
          </div>
        )}
      </main>
    </div>
  )
}
