'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MaterialUpload({
  moduleId,
  userId,
}: {
  moduleId: string
  userId: string
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    // Profil sicherstellen
    await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })

    let fileUrl = null
    let fileType = null

    // Datei hochladen falls vorhanden
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${moduleId}/${Date.now()}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(path, file)

      if (uploadError) {
        setError('Fehler beim Hochladen: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('materials').getPublicUrl(data.path)
      fileUrl = urlData.publicUrl
      fileType = ext ?? 'file'
    }

    // Material in DB speichern
    const { error: dbError } = await supabase.from('materials').insert({
      module_id: moduleId,
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl,
      file_type: fileType,
      sort_score: 0,
    })

    if (dbError) {
      setError('Fehler: ' + dbError.message)
      setLoading(false)
      return
    }

    setTitle('')
    setDescription('')
    setFile(null)
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors text-sm"
      >
        + Material hochladen
      </button>
    )
  }

  return (
    <form onSubmit={handleUpload} className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900">Material hochladen</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="z.B. Zusammenfassung Klausur SS25"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kurze Beschreibung was drin ist..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datei (optional)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />
        <p className="text-xs text-gray-400 mt-1">PDF, Word, PowerPoint, Bilder — max. 50MB</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Wird hochgeladen...' : 'Hochladen'}
        </button>
      </div>
    </form>
  )
}
