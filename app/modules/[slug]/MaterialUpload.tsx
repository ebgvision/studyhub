'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

async function collectFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      (entry as FileSystemFileEntry).file((f) => resolve([f]))
    })
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    return new Promise((resolve) => {
      reader.readEntries(async (entries) => {
        const nested = await Promise.all(entries.map(collectFilesFromEntry))
        resolve(nested.flat())
      })
    })
  }
  return []
}

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
  const [isFolder, setIsFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function applyFiles(selected: File[], folder = false, fName = '') {
    setFiles(selected)
    setIsFolder(folder)
    setFolderName(fName)
    if (selected.length > 0 && !title) {
      setTitle(fName || selected[0].name.replace(/\.[^.]+$/, ''))
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    applyFiles(selected, false)
  }

  function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return
    const fName = (selected[0] as any).webkitRelativePath?.split('/')[0] ?? 'Ordner'
    applyFiles(selected, true, fName)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const items = Array.from(e.dataTransfer.items)
    const entries = items.map((i) => i.webkitGetAsEntry()).filter(Boolean) as FileSystemEntry[]

    const hasFolder = entries.some((en) => en.isDirectory)
    if (hasFolder) {
      const folderEntry = entries.find((en) => en.isDirectory)!
      const collectedFiles = await collectFilesFromEntry(folderEntry)
      applyFiles(collectedFiles, true, folderEntry.name)
    } else {
      const dropped = Array.from(e.dataTransfer.files)
      applyFiles(dropped, false)
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
      if (isFolder && files.length > 1) {
        const uploadedPaths: string[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const relativePath = (file as any).webkitRelativePath || file.name
          const storagePath = `${moduleId}/${Date.now()}-${relativePath}`
          const { data, error: upErr } = await supabase.storage.from('materials').upload(storagePath, file)
          if (upErr) throw new Error(upErr.message)
          uploadedPaths.push(data.path)
          setProgress(Math.round(((i + 1) / files.length) * 100))
        }
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
      setIsFolder(false)
      setFolderName('')
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
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      {/* Drop-Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          dragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
        }`}
      >
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip" onChange={handleFileInput} className="hidden" />
        <input ref={folderInputRef} type="file" {...({ webkitdirectory: '', directory: '' } as any)} multiple onChange={handleFolderInput} className="hidden" />
        {files.length === 0 ? (
          <>
            <div className="text-2xl mb-1">📂</div>
            <p className="text-sm text-gray-600 font-medium">Datei oder Ordner hierher ziehen</p>
            <div className="flex gap-2 justify-center mt-2" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
                📄 Datei auswählen
              </button>
              <button type="button" onClick={() => folderInputRef.current?.click()}
                className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
                📁 Ordner auswählen
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-teal-700 font-medium">
            {isFolder
              ? `📁 Ordner: ${folderName} · ${files.length} Dateien`
              : files.length === 1
                ? `📄 ${files[0].name}`
                : `📄 ${files.length} Dateien ausgewählt`}
            <p className="text-xs text-gray-400 mt-0.5 font-normal">Nochmal ziehen oder Button klicken zum Ändern</p>
          </div>
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
