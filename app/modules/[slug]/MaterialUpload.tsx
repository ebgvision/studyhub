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
  const [files, setFiles] = useState<File[]>([])
  const [folderMode, setFolderMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
    // Auto-Titel aus erstem Dateinamen
    if (selected.length > 0 && !title) {
      if (folderMode && selected.length > 1) {
        // Ordnername aus Pfad extrahieren
        const path = (selected[0] as any).webkitRelativePath as string
        const folder = path.split('/')[0]
        setTitle(folder)
      } else {
        setTitle(selected[0].name.replace(/\.[^.]+$/, ''))
      }
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || files.length === 0) return
    setLoading(true)
    setError(null)
    setProgress(0)

    await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })

    try {
      if (folderMode && files.length > 1) {
        // Ordner-Upload: alle Dateien mit relativem Pfad
        const uploadedPaths: string[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const relativePath = (file as any).webkitRelativePath || file.name
          const storagePath = `${moduleId}/${Date.now()}-${relativePath}`
          const { data, error: upErr } = await supabase.storage
            .from('materials')
            .upload(storagePath, file)
          if (upErr) throw new Error(upErr.message)
          uploadedPaths.push(data.path)
          setProgress(Math.round(((i + 1) / files.length) * 100))
        }

        // Ersten File als Haupt-URL, den ganzen Ordner als Eintrag
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(uploadedPaths[0])
        await supabase.from('materials').insert({
          module_id: moduleId,
          user_id: userId,
          title: title.trim(),
          description: `${files.length} Dateien · ${description.trim() || ''}`,
          file_url: urlData.publicUrl,
          file_type: 'folder',
          sort_score: 0,
        })
      } else {
        // Einzelne Datei
        const file = files[0]
        const ext = file.name.split('.').pop()
        const path = `${moduleId}/${Date.now()}.${ext}`
        const { data, error: upErr } = await supabase.storage.from('materials').upload(path, file)
        if (upErr) throw new Error(upErr.message)
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(data.path)

        await supabase.from('materials').insert({
          module_id: moduleId,
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          file_url: urlData.publicUrl,
          file_type: ext ?? 'file',
          sort_score: 0,
        })
      }

      setTitle('')
      setDescription('')
      setFiles([])
      setFolderMode(false)
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError('Fehler beim Hochladen: ' + err.message)
    }

    setLoading(false)
    setProgress(0)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors text-sm"
      >
        + Material hochladen
      </button>
    )
  }

  return (
    <form onSubmit={handleUpload} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 text-sm">Material hochladen</h4>
        {/* Einzel / Ordner Toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button type="button" onClick={() => setFolderMode(false)}
            className={`px-3 py-1.5 font-medium transition-colors ${!folderMode ? 'bg-teal-600 text-white' : 'bg-white text-gray-500'}`}>
            Datei
          </button>
          <button type="button" onClick={() => setFolderMode(true)}
            className={`px-3 py-1.5 font-medium transition-colors ${folderMode ? 'bg-teal-600 text-white' : 'bg-white text-gray-500'}`}>
            Ordner
          </button>
        </div>
      </div>

      {/* Datei-Auswahl (Pflicht) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {folderMode ? 'Ordner auswählen *' : 'Datei auswählen *'}
        </label>
        {folderMode ? (
          <input
            type="file"
            {...({ webkitdirectory: '', directory: '' } as any)}
            multiple
            required
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        ) : (
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip"
            required
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        )}
        {files.length > 1 && (
          <p className="text-xs text-teal-600 mt-1">{files.length} Dateien ausgewählt</p>
        )}
      </div>

      {/* Titel */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Titel *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="z.B. Zusammenfassung Klausur SS25"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
        />
      </div>

      {/* Beschreibung */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kurze Beschreibung..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none"
        />
      </div>

      {/* Progress */}
      {loading && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-colors">
          Abbrechen
        </button>
        <button type="submit" disabled={loading || !title.trim() || files.length === 0}
          className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors">
          {loading ? `Hochladen… ${progress > 0 ? progress + '%' : ''}` : 'Hochladen'}
        </button>
      </div>
    </form>
  )
}
