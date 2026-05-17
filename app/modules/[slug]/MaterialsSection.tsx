'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Material = {
  id: string
  title: string
  description: string | null
  file_url: string | null
  file_type: string | null
  like_count: number
  outdated_count: number
  is_outdated_warned: boolean
  created_at: string
  user_id: string | null
}

function fileIcon(type: string | null) {
  if (!type) return '📄'
  if (['pdf'].includes(type)) return '📕'
  if (['doc', 'docx'].includes(type)) return '📝'
  if (['ppt', 'pptx'].includes(type)) return '📊'
  if (['png', 'jpg', 'jpeg'].includes(type)) return '🖼️'
  return '📄'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function MaterialsSection({
  initialMaterials,
  userId,
  likedIds: initialLikedIds,
  outdatedIds: initialOutdatedIds,
}: {
  initialMaterials: Material[]
  userId: string
  likedIds: string[]
  outdatedIds: string[]
}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [outdatedIds, setOutdatedIds] = useState<Set<string>>(new Set(initialOutdatedIds))
  const supabase = createClient()

  async function toggleLike(material: Material) {
    const alreadyLiked = likedIds.has(material.id)

    if (alreadyLiked) {
      await supabase.from('material_likes').delete()
        .eq('user_id', userId).eq('material_id', material.id)
      const newCount = material.like_count - 1
      await supabase.from('materials').update({ like_count: newCount, sort_score: newCount })
        .eq('id', material.id)
      setLikedIds((prev) => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials((prev) => prev.map((m) =>
        m.id === material.id ? { ...m, like_count: newCount } : m
      ))
    } else {
      await supabase.from('material_likes').insert({ user_id: userId, material_id: material.id })
      const newCount = material.like_count + 1
      await supabase.from('materials').update({ like_count: newCount, sort_score: newCount, last_liked_at: new Date().toISOString() })
        .eq('id', material.id)
      setLikedIds((prev) => new Set([...prev, material.id]))
      setMaterials((prev) => prev.map((m) =>
        m.id === material.id ? { ...m, like_count: newCount } : m
      ))
    }
  }

  async function toggleOutdated(material: Material) {
    const alreadyFlagged = outdatedIds.has(material.id)

    if (alreadyFlagged) {
      await supabase.from('material_outdated_flags').delete()
        .eq('user_id', userId).eq('material_id', material.id)
      const newCount = material.outdated_count - 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds((prev) => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials((prev) => prev.map((m) =>
        m.id === material.id ? { ...m, outdated_count: newCount } : m
      ))
    } else {
      await supabase.from('material_outdated_flags').insert({ user_id: userId, material_id: material.id })
      const newCount = material.outdated_count + 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds((prev) => new Set([...prev, material.id]))
      setMaterials((prev) => prev.map((m) =>
        m.id === material.id ? { ...m, outdated_count: newCount } : m
      ))
    }
  }

  // Nach Likes sortieren (höchste zuerst)
  const sorted = [...materials].sort((a, b) => b.like_count - a.like_count)

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-500 font-medium">Noch keine Materialien für dieses Modul.</p>
        <p className="text-gray-400 text-sm mt-1">Sei der Erste und lade etwas hoch!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((material) => {
        const totalReactions = material.like_count + material.outdated_count
        const outdatedPercent = totalReactions >= 10
          ? Math.round((material.outdated_count / totalReactions) * 100)
          : 0
        const isOutdatedWarn = totalReactions >= 10 && outdatedPercent >= 30 && material.like_count / totalReactions < 0.7

        return (
          <div
            key={material.id}
            className={`bg-white rounded-xl border p-5 transition-all ${
              isOutdatedWarn ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
            }`}
          >
            {/* Veraltet-Badge */}
            {isOutdatedWarn && (
              <div className="flex items-center gap-2 text-orange-600 text-xs font-semibold mb-3 bg-orange-100 rounded-lg px-3 py-1.5 w-fit">
                ⚠️ Möglicherweise veraltet — Community hat es markiert
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-2xl">{fileIcon(material.file_type)}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{material.title}</div>
                  {material.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{material.description}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{formatDate(material.created_at)}</div>
                </div>
              </div>

              {/* Download Button */}
              {material.file_url && (
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                >
                  ↓ Öffnen
                </a>
              )}
            </div>

            {/* Aktionen */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleLike(material)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  likedIds.has(material.id) ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'
                }`}
              >
                👍 {material.like_count > 0 ? material.like_count : ''} Hilfreich
              </button>

              <button
                onClick={() => toggleOutdated(material)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  outdatedIds.has(material.id) ? 'text-orange-500 font-medium' : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                🕐 {material.outdated_count > 0 ? material.outdated_count : ''} Veraltet
              </button>

              {totalReactions >= 10 && (
                <span className="ml-auto text-xs text-gray-300">
                  {outdatedPercent}% als veraltet markiert
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
