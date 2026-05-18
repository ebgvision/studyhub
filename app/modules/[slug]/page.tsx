export const dynamic = 'force-dynamic'

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

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!module) notFound()

  const { data: stats } = await supabase
    .from('module_stats')
    .select('study_days, grade, passed')
    .eq('module_id', module.id)

  const { data: rawMessages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('module_id', module.id)
    .order('created_at', { ascending: true })

  // Fetch profiles separately (avoids FK-join issues)
  const uniqueUserIds = [...new Set((rawMessages ?? []).map((m: any) => m.user_id).filter(Boolean))]
  const { data: profilesData } = uniqueUserIds.length > 0
    ? await supabase.from('profiles').select('id, username').in('id', uniqueUserIds)
    : { data: [] as { id: string; username: string | null }[] }

  const profileMap: Record<string, { username: string | null }> = {}
  for (const p of profilesData ?? []) profileMap[p.id] = { username: p.username }

  const initialMessages = (rawMessages ?? []).map((m: any) => ({
    ...m,
    profiles: profileMap[m.user_id] ?? null,
  }))

  const { data: materials } = await supabase
    .from('materials')
    .select('*, files')
    .eq('module_id', module.id)
    .order('sort_score', { ascending: false })

  const { data: myMaterialLikes } = await supabase
    .from('material_likes')
    .select('material_id')
    .eq('user_id', user.id)

  const { data: myOutdatedFlags } = await supabase
    .from('material_outdated_flags')
    .select('material_id')
    .eq('user_id', user.id)

  const { data: myStats } = await supabase
    .from('module_stats')
    .select('id')
    .eq('module_id', module.id)
    .eq('user_id', user.id)
    .single()

  // Durchschnitte
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
      <nav className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-teal-600 transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-sm text-gray-600 font-medium truncate max-w-[200px]">{module.name}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Ausloggen
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-5">

        {/* Modul-Header mit eingebetteten Stats */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  {module.semester ? `${module.semester}. Semester` : 'Kein Semester'}
                </span>
                {module.code && (
                  <span className="text-xs font-bold font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                    {module.code}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{module.name}</h1>
              <p className="text-gray-400 text-xs mt-0.5">RheinAhrCampus Remagen · HS Koblenz</p>
            </div>
          </div>

          {/* Community-Stats kompakt */}
          {totalSubmissions > 0 ? (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                📊 Community · {totalSubmissions} Einreichungen
              </p>
              <div className="flex gap-4">
                {avgDays && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{avgDays}</div>
                    <div className="text-xs text-gray-500">Ø Lerntage</div>
                  </div>
                )}
                {avgGrade && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{avgGrade}</div>
                    <div className="text-xs text-gray-500">Ø Note</div>
                  </div>
                )}
                {passRate !== null && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${passRate >= 70 ? 'text-green-500' : passRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {passRate}%
                    </div>
                    <div className="text-xs text-gray-500">Bestanden</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Noch keine Community-Statistiken für dieses Modul.</p>
            </div>
          )}

          {/* Submit-Button */}
          <StatsForm moduleId={module.id} hasSubmitted={!!myStats} />
        </div>

        {/* Live-Chat */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 px-1">💬 Live-Chat</h2>
          <Chat
            moduleId={module.id}
            userId={user.id}
            initialMessages={initialMessages ?? []}
          />
        </div>

        {/* Lernmaterialien */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 px-1">📁 Lernmaterialien</h2>
          <div className="space-y-3">
            <MaterialsSection
              initialMaterials={materials ?? []}
              userId={user.id}
              currentUsername={profile?.username ?? null}
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
