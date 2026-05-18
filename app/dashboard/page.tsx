export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import Link from 'next/link'
import FavoritesSection from './FavoritesSection'
import FeedbackChat from './FeedbackChat'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: modules } = await supabase
    .from('modules')
    .select('id, name, slug, code, semester, module_type')
    .order('name')

  const { data: favRows } = await supabase
    .from('module_favorites')
    .select('module_id')
    .eq('user_id', user.id)

  const favoriteModuleIds = (favRows ?? []).map((r) => r.module_id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_anonymous, is_admin')
    .eq('id', user.id)
    .single()

  const { data: rawFeedback } = await supabase
    .from('feedback_messages')
    .select('*')
    .order('created_at', { ascending: true })

  const feedbackUserIds = [...new Set((rawFeedback ?? []).map((m: any) => m.user_id).filter(Boolean))]
  const { data: feedbackProfiles } = feedbackUserIds.length > 0
    ? await supabase.from('profiles').select('id, username, is_anonymous').in('id', feedbackUserIds)
    : { data: [] as { id: string; username: string | null; is_anonymous: boolean }[] }

  const profileMap: Record<string, { username: string | null; is_anonymous: boolean }> = {}
  for (const p of feedbackProfiles ?? []) profileMap[p.id] = { username: p.username, is_anonymous: p.is_anonymous }

  const initialFeedback = (rawFeedback ?? []).map((m: any) => ({
    id: m.id,
    content: m.content,
    created_at: m.created_at,
    user_id: m.user_id,
    username: profileMap[m.user_id]?.is_anonymous ? 'Anonym' : (profileMap[m.user_id]?.username ?? null),
    is_anonymous: profileMap[m.user_id]?.is_anonymous ?? false,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-teal-600">StudyHub</span>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-colors text-base">
              ⚙️
            </Link>
            <form action={logout}>
              <button type="submit" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors text-base">
                ↩
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Campus Banner */}
        <div className="bg-teal-600 text-white rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div>
            <div className="text-xs font-medium text-teal-200 mb-0.5">Fachbereich · HS Koblenz</div>
            <div className="text-base sm:text-lg font-bold leading-snug">Wirtschafts- und Sozialwissenschaften</div>
            <div className="text-teal-300 text-xs mt-0.5">RheinAhrCampus Remagen</div>
          </div>
          <Link
            href="/dashboard/search"
            className="self-start bg-white text-teal-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors"
          >
            🔍 Module suchen
          </Link>
        </div>

        {/* Favoriten */}
        <FavoritesSection allModules={modules ?? []} userId={user.id} initialFavoriteIds={favoriteModuleIds} />

        {/* Feedback-Bereich */}
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 mb-3">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💬</span>
              <div>
                <h2 className="text-sm font-bold text-amber-800">Deine Meinung zählt!</h2>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  StudyHub ist noch in der Entwicklung — hilf uns, es besser zu machen!
                  Schreib uns deine <strong>Wünsche, Ideen oder Verbesserungsvorschläge</strong>.
                  Jedes Feedback hilft! 🙏
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-700 mb-2 px-1">💡 Feedback & Ideen</h2>
          <FeedbackChat
            userId={user.id}
            isAnonymous={profile?.is_anonymous ?? false}
            isAdmin={profile?.is_admin ?? false}
            initialMessages={initialFeedback}
          />
        </div>

      </main>
    </div>
  )
}
