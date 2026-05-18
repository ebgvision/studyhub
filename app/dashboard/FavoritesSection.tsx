'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Module = {
  id: string
  name: string
  slug: string
  code: string | null
  semester: number | null
  module_type: string
}

export default function FavoritesSection({
  allModules,
  userId,
  initialFavoriteIds,
}: {
  allModules: Module[]
  userId: string
  initialFavoriteIds: string[]
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds)
  const supabase = createClient()

  async function toggleFavorite(module: Module) {
    const isFav = favoriteIds.includes(module.id)
    if (isFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== module.id))
      await supabase.from('module_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('module_id', module.id)
    } else {
      setFavoriteIds((prev) => [...prev, module.id])
      await supabase.from('module_favorites')
        .insert({ user_id: userId, module_id: module.id })
    }
  }

  const favModules = allModules.filter((m) => favoriteIds.includes(m.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">⭐ Meine Module</h2>
        <Link href="/dashboard/search" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
          Alle Module →
        </Link>
      </div>

      {favModules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-gray-500 text-sm font-medium">Noch keine Favoriten</p>
          <p className="text-gray-400 text-xs mt-1">
            Markiere Module mit einem Stern — sie erscheinen dann hier als Direktlinks.
          </p>
          <Link
            href="/dashboard/search"
            className="inline-block mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Module suchen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favModules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3 hover:border-teal-300 hover:shadow-sm transition-all group">
              <button
                onClick={() => toggleFavorite(module)}
                className="text-yellow-400 hover:text-gray-300 flex-shrink-0 mt-0.5 transition-colors"
                title="Stern entfernen"
              >
                ★
              </button>
              <Link href={`/modules/${module.slug}`} className="flex-1 min-w-0">
                {module.code && (
                  <div className="text-xs font-bold text-gray-400 font-mono mb-0.5">{module.code}</div>
                )}
                <div className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">
                  {module.name}
                </div>
                {module.semester && (
                  <div className="text-xs text-gray-400 mt-0.5">{module.semester}. Semester</div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
