'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FolderBrowser from './FolderBrowser'

type FileEntry = { name: string; relativePath: string; url: string }

type Material = {
  id: string
  title: string
  description: string | null
  file_url: string | null
  file_type: string | null
  files: FileEntry[] | null
  like_count: number
  outdated_count: number
  comment_count: number
  is_outdated_warned: boolean
  created_at: string
  user_id: string | null
}

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string | null
  username: string | null
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function avatarLetter(username: string | null) {
  return (username ?? '?')[0].toUpperCase()
}

export default function MaterialsSection({
  initialMaterials,
  userId,
  currentUsername,
  likedIds: initialLikedIds,
  outdatedIds: initialOutdatedIds,
}: {
  initialMaterials: Material[]
  userId: string
  currentUsername: string | null
  likedIds: string[]
  outdatedIds: string[]
}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [outdatedIds, setOutdatedIds] = useState<Set<string>>(new Set(initialOutdatedIds))
  const [folderMaterial, setFolderMaterial] = useState<Material | null>(null)
  const [sortBy, setSortBy] = useState<'likes' | 'date'>('likes')

  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [commentsCache, setCommentsCache] = useState<Record<string, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
      setLikedIds(prev => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, like_count: newCount } : m))
    } else {
      await supabase.from('material_likes').insert({ user_id: userId, material_id: material.id })
      const newCount = material.like_count + 1
      await supabase.from('materials').update({ like_count: newCount, sort_score: newCount, last_liked_at: new Date().toISOString() }).eq('id', material.id)
      setLikedIds(prev => new Set([...prev, material.id]))
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, like_count: newCount } : m))
    }
  }

  async function toggleOutdated(material: Material) {
    const alreadyFlagged = outdatedIds.has(material.id)
    if (alreadyFlagged) {
      await supabase.from('material_outdated_flags').delete().eq('user_id', userId).eq('material_id', material.id)
      const newCount = material.outdated_count - 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds(prev => { const n = new Set(prev); n.delete(material.id); return n })
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, outdated_count: newCount } : m))
    } else {
      await supabase.from('material_outdated_flags').insert({ user_id: userId, material_id: material.id })
      const newCount = material.outdated_count + 1
      await supabase.from('materials').update({ outdated_count: newCount }).eq('id', material.id)
      setOutdatedIds(prev => new Set([...prev, material.id]))
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, outdated_count: newCount } : m))
    }
  }

  async function toggleComments(material: Material) {
    if (openCommentId === material.id) {
      setOpenCommentId(null)
      return
    }
    setOpenCommentId(material.id)
    if (commentsCache[material.id]) return

    setLoadingComments(material.id)
    const { data } = await supabase
      .from('material_comments')
      .select('*')
      .eq('material_id', material.id)
      .order('created_at', { ascending: true })

    const userIds = [...new Set((data ?? []).map((c: any) => c.user_id).filter(Boolean))]
    let profileMap: Record<string, string | null> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds)
      for (const p of (profiles ?? [])) profileMap[p.id] = p.username
    }

    const comments: Comment[] = (data ?? []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      username: profileMap[c.user_id] ?? null,
    }))

    setCommentsCache(prev => ({ ...prev, [material.id]: comments }))
    setLoadingComments(null)
  }

  async function submitComment(material: Material) {
    const content = (commentInputs[material.id] ?? '').trim()
    if (!content || submitting) return
    setSubmitting(true)

    const { data: inserted } = await supabase
      .from('material_comments')
      .insert({ material_id: material.id, user_id: userId, content })
      .select()
      .single()

    if (inserted) {
      const newCount = material.comment_count + 1
      await supabase.from('materials').update({ comment_count: newCount }).eq('id', material.id)
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, comment_count: newCount } : m))

      const newComment: Comment = {
        id: inserted.id,
        content: inserted.content,
        created_at: inserted.created_at,
        user_id: userId,
        username: currentUsername,
      }
      setCommentsCache(prev => ({
        ...prev,
        [material.id]: [...(prev[material.id] ?? []), newComment],
      }))
      setCommentInputs(prev => ({ ...prev, [material.id]: '' }))
    }
    setSubmitting(false)
  }

  const sorted = [...materials].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.like_count - a.like_count
  })

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
      {folderMaterial && (
        <FolderBrowser
          title={folderMaterial.title}
          files={folderMaterial.files ?? []}
          onClose={() => setFolderMaterial(null)}
        />
      )}

      {/* Sort Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSortBy('likes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === 'likes' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          👍 Meiste Likes
        </button>
        <button
          onClick={() => setSortBy('date')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === 'date' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          🕐 Neueste
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map((material) => {
          const totalReactions = material.like_count + material.outdated_count
          const outdatedPercent = totalReactions >= 10
            ? Math.round((material.outdated_count / totalReactions) * 100) : 0
          const isOutdatedWarn = totalReactions >= 10 && outdatedPercent >= 30 && material.like_count / totalReactions < 0.7
          const isCommentsOpen = openCommentId === material.id
          const comments = commentsCache[material.id] ?? []

          const groupedComments = comments.map((c, i) => ({
            ...c,
            isGrouped: i > 0 && comments[i - 1].user_id === c.user_id,
          }))

          return (
            <div key={material.id} className={`bg-white rounded-xl border ${isOutdatedWarn ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
              <div className="p-4">
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

                  <div className="flex gap-2 flex-shrink-0">
                    {material.file_type === 'folder' ? (
                      <button
                        onClick={() => setFolderMaterial(material)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                      >
                        📁 Ordner öffnen
                      </button>
                    ) : material.file_url ? (
                      <>
                        <button
                          onClick={() => window.open(material.file_url!, '_blank', 'noopener,noreferrer')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          👁 Vorschau
                        </button>
                        <button
                          onClick={() => downloadFile(material.file_url!, material.title)}
                          className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                        >
                          ↓ Herunterladen
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Aktionen unten */}
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
                  <button
                    onClick={() => toggleComments(material)}
                    className={`flex items-center gap-1 text-xs transition-colors ml-auto ${isCommentsOpen ? 'text-teal-600 font-medium' : 'text-gray-400 hover:text-teal-500'}`}
                  >
                    💬 {material.comment_count > 0 ? material.comment_count : ''} Kommentare {isCommentsOpen ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Kommentarbereich */}
              {isCommentsOpen && (
                <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl px-4 py-3">
                  {loadingComments === material.id ? (
                    <p className="text-xs text-gray-400 text-center py-3">Lädt...</p>
                  ) : groupedComments.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">Noch keine Kommentare. Sei der Erste!</p>
                  ) : (
                    <div className="space-y-0.5 mb-3">
                      {groupedComments.map(comment => (
                        <div key={comment.id} className={`flex gap-2.5 ${comment.isGrouped ? 'mt-0.5' : 'mt-3'}`}>
                          <div className="flex-shrink-0 w-7">
                            {!comment.isGrouped ? (
                              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                                {avatarLetter(comment.username)}
                              </div>
                            ) : (
                              <div className="w-7" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {!comment.isGrouped && (
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-gray-800">{comment.username ?? 'Anonym'}</span>
                                <span className="text-xs text-gray-400">{formatTime(comment.created_at)}</span>
                              </div>
                            )}
                            <div className="group relative flex items-center gap-2">
                              <p className="text-xs text-gray-700 leading-relaxed">{comment.content}</p>
                              {comment.isGrouped && (
                                <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {formatTime(comment.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Kommentar schreiben..."
                      value={commentInputs[material.id] ?? ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [material.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') submitComment(material) }}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <button
                      onClick={() => submitComment(material)}
                      disabled={submitting || !(commentInputs[material.id] ?? '').trim()}
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors disabled:opacity-40"
                    >
                      Senden
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
