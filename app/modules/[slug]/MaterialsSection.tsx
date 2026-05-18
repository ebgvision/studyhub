'use client'

import { useState, useCallback } from 'react'
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
  if (type === 'pdf') return '📕'
  if (['doc', 'docx'].includes(type)) return '📝'
  if (['ppt', 'pptx'].includes(type)) return '📊'
  if (['png', 'jpg', 'jpeg', 'gif'].includes(type)) return '🖼️'
  if (['zip', 'rar'].includes(type)) return '🗜️'
  return '📄'
}

function canPreview(type: string | null) {
  if (!type) return false
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt'].includes(type)
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState<string>('')
  const supabase = createClient()

  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }, [])

  async function toggleLike(material: Material) {
    const alreadyLiked = likedIds.has(material.id)
    if (alreadyLiked) {
      await supabase.from('material_likes').delete().eq('user_id', userId).eq('material_id', material.id)
      const newCount = material.like_count - 1
      await supabase.from('materials').update({ like_count: newCount, sort_score: newCount }).eq('id', material.id)
      setLikedIds((prev) => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, like_count: newCount } : m))
    } else {
      await supabase.from('material_likes').insert({ user_id: userId, material_id: material.id })
      const newCount = material.like_count + 1
      await supabase.from('materials').update({ like_count: newCount, sort_score: newCount, last_liked_at: new Date().toISOString() }).eq('id', material.id)
      setLikedIds((prev) => new Set([...prev, material.id]))
      setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, like_count: newCount } : m))
    }
  }

  async function toggleOutdated(material: Material) {
    const alreadyFlagged = outdatedIds.has(material.id)
    if (alreadyFlagged) {
      await supabase.from('material_outdated_flags').delete().eq('user_id', userId).eq('material_id', material.id)
      const newCount = material.outdated_count - 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds((prev) => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, outdated_count: newCount } : m))
    } else {
      await supabase.from('material_outdated_flags').insert({ user_id: userId, material_id: material.id })
      const newCount = material.outdated_count + 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds((prev) => new Set([...prev, material.id]))
      setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, outdated_count: newCount } : m))
    }
  }

  const sorted = [...materials].sort((a, b) => b.like_count - a.like_count)

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-sm font-medium">Noch keine Materialien für dieses Modul.</p>
        <p className="text-gray-400 text-xs mt-1">Sei der Erste und lade etwas hoch!</p>
      </div>
    )
  }

  return (
    <>
      {/* Vorschau-Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">{previewTitle || 'Vorschau'}</span>
              <button onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-auto">
              {previewUrl.match(/\.(png|jpg|jpeg|gif)(\?|$)/i) ? (
                <img src={previewUrl} alt="Vorschau" className="w-full h-auto" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[70vh]" title="Vorschau" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((material) => {
          const totalReactions = material.like_count + material.outdated_count
          const outdatedPercent = totalReactions >= 10
            ? Math.round((material.outdated_count / totalReactions) * 100) : 0
          const isOutdatedWarn = totalReactions >= 10 && outdatedPercent >= 30 && material.like_count / totalReactions < 0.7
          const preview = canPreview(material.file_type)

          return (
            <div
              key={material.id}
              className={`bg-white rounded-xl border p-4 ${isOutdatedWarn ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}
            >
              {isOutdatedWarn && (
                <div className="text-orange-600 text-xs font-semibold mb-2 bg-orange-100 rounded-lg px-2 py-1 w-fit">
                  ⚠️ Möglicherweise veraltet
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{fileIcon(material.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{material.title}</div>
                  {material.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{material.description}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(material.created_at)}</div>
                </div>

                {/* Vorschau + Download Buttons */}
                {material.file_url && (
                  <div className="flex gap-2 flex-shrink-0">
                    {preview && (
                      <button
                        onClick={() => { setPreviewUrl(material.file_url!); setPreviewTitle(material.title) }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        👁 Vorschau
                      </button>
                    )}
                    <button
                      onClick={() => downloadFile(material.file_url!, material.title)}
                      className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                    >
                      ↓ Herunterladen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleLike(material)}
                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${likedIds.has(material.id) ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}
                >
                  👍 {material.like_count > 0 ? material.like_count : ''} Hilfreich
                </button>
                <button
                  onClick={() => toggleOutdated(material)}
                  className={`flex items-center gap-1 text-xs transition-colors ${outdatedIds.has(material.id) ? 'text-orange-500 font-medium' : 'text-gray-400 hover:text-orange-400'}`}
                >
                  🕐 {material.outdated_count > 0 ? material.outdated_count : ''} Veraltet
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
