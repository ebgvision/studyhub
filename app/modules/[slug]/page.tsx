import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import Link from 'next/link'
import StatsForm from './StatsForm'
import Chat from './Chat'
import MaterialUpload from './MaterialUpload'
import MaterialsSection from './MaterialsSection'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Modul laden
  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!module) notFound()

  // Statistiken laden
  const { data: stats } = await supabase
    .from('module_stats')
    .select('study_days, grade, passed')
    .eq('module_id', module.id)

  // Chat-Nachrichten laden
  const { data: initialMessages } = await supabase
    .from('chat_messages')
    .select('*, profiles(username)')
    .eq('module_id', module.id)
    .order('created_at', { ascending: true })

  // Materialien laden (nach Likes sortiert)
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .eq('module_id', module.id)
    .order('sort_score', { ascending: false })

  // Likes & Veraltet-Flags des Users laden
  const { data: myMaterialLikes } = await supabase
    .from('material_likes')
    .select('material_id')
    .eq('user_id', user.id)

  const { data: myOutdatedFlags } = await supabase
    .from('material_outdated_flags')
    .select('material_id')
    .eq('user_id', user.id)

  // Hat dieser User schon eine Statistik eingereicht?
  const { data: myStats } = await supabase
    .from('module_stats')
    .select('id')
    .eq('module_id', module.id)
    .eq('user_id', user.id)
    .single()

  // Durchschnitte berechnen
  const totalSubmissions = stats?.length ?? 0
  const avgDays = totalSubmissions > 0
    ? Math.round((stats!.reduce((sum, s) => sum + s.study_days, 0)) / totalSubmissions)
    : null
  const gradesOnly = stats?.filter(s => s.grade !== null) ?? []
  const avgGrade = gradesOnly.length > 0
    ? (gradesOnly.reduce((sum, s) => sum + s.grade!, 0) / gradesOnly.length).toFixed(1)
    : null
  const passedCount = stats?.filter(s => s.passed).length ?? 0
  const passRate = totalSubmissions > 0
    ? Math.round((passedCount / totalSubmissions) * 100)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-teal-600 transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-sm text-gray-600 font-medium">{module.name}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Ausloggen
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Modul-Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  Modul · {module.semester ? `${module.semester}. Semester` : 'Kein Semester'}
                </span>
                {module.code && (
                  <span className="text-xs font-bold font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                    {module.code}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
              <p className="text-gray-400 text-sm mt-1">RheinAhrCampus Remagen · HS Koblenz</p>
            </div>
          </div>
        </div>

        {/* Statistiken */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Community-Statistiken</h2>

          {totalSubmissions === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">Noch keine Statistiken für dieses Modul.</p>
              <p className="text-gray-400 text-sm mt-1">Sei der Erste und reiche deine Erfahrung ein!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Lernzeit */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-teal-600">{avgDays}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">Ø Lerntage</div>
                <div className="text-xs text-gray-400 mt-0.5">bis zur Prüfung</div>
              </div>
              {/* Durchschnittsnote */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-teal-600">{avgGrade ?? '–'}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">Ø Note</div>
                <div className="text-xs text-gray-400 mt-0.5">aus {gradesOnly.length} Angaben</div>
              </div>
              {/* Bestehensquote */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className={`text-3xl font-bold ${passRate! >= 70 ? 'text-green-500' : passRate! >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {passRate}%
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">Bestehensquote</div>
                <div className="text-xs text-gray-400 mt-0.5">aus {totalSubmissions} Einreichungen</div>
              </div>
            </div>
          )}

          {/* Formular zum Einreichen */}
          <StatsForm moduleId={module.id} hasSubmitted={!!myStats} />
        </div>

        {/* Live-Chat */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">💬 Live-Chat</h2>
          <Chat
            moduleId={module.id}
            userId={user.id}
            initialMessages={initialMessages ?? []}
          />
        </div>

        {/* Lernmaterialien */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">📁 Lernmaterialien</h2>
          <div className="space-y-4">
            <MaterialsSection
              initialMaterials={materials ?? []}
              userId={user.id}
              likedIds={(myMaterialLikes ?? []).map(l => l.material_id)}
              outdatedIds={(myOutdatedFlags ?? []).map(f => f.material_id)}
            />
            <MaterialUpload moduleId={module.id} userId={user.id} />
          </div>
        </div>

      </main>
    </div>
  )
}
