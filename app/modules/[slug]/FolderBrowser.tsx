'use client'

import { useState } from 'react'

type FileEntry = { name: string; relativePath: string; url: string }

type TreeNode =
  | { type: 'file'; name: string; url: string; relativePath: string }
  | { type: 'dir'; name: string; children: Record<string, TreeNode> }

function buildTree(files: FileEntry[]): Record<string, TreeNode> {
  const root: Record<string, TreeNode> = {}
  for (const f of files) {
    const parts = f.relativePath.split('/').filter(Boolean)
    // Skip the first part if it's the root folder name (same as title)
    const pathParts = parts.length > 1 ? parts.slice(1) : parts
    let current = root
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      if (i === pathParts.length - 1) {
        current[part] = { type: 'file', name: part, url: f.url, relativePath: f.relativePath }
      } else {
        if (!current[part] || current[part].type === 'file') {
          current[part] = { type: 'dir', name: part, children: {} }
        }
        current = (current[part] as { type: 'dir'; name: string; children: Record<string, TreeNode> }).children
      }
    }
  }
  return root
}

function canPreview(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt', 'svg'].includes(ext)
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return '📕'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['ppt', 'pptx'].includes(ext)) return '📊'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return '🖼️'
  if (['zip', 'rar'].includes(ext)) return '🗜️'
  if (['txt', 'md'].includes(ext)) return '📄'
  return '📄'
}

function TreeView({
  nodes,
  path,
  onNavigate,
}: {
  nodes: Record<string, TreeNode>
  path: string[]
  onNavigate: (p: string[]) => void
}) {
  const entries = Object.entries(nodes).sort(([, a], [, b]) => {
    if (a.type === b.type) return a.name.localeCompare(b.name, 'de')
    return a.type === 'dir' ? -1 : 1
  })

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">Ordner ist leer</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {entries.map(([key, node]) => (
        <div key={key} className="flex items-center gap-3 py-2.5 px-1 hover:bg-gray-50 rounded-lg group">
          {node.type === 'dir' ? (
            <>
              <span className="text-lg flex-shrink-0">📁</span>
              <button
                className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-teal-600 transition-colors"
                onClick={() => onNavigate([...path, key])}
              >
                {node.name}
              </button>
              <button
                onClick={() => onNavigate([...path, key])}
                className="text-xs text-gray-400 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Öffnen →
              </button>
            </>
          ) : (
            <>
              <span className="text-lg flex-shrink-0">{fileIcon(node.name)}</span>
              <span className="flex-1 text-sm text-gray-800 truncate">{node.name}</span>
              <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canPreview(node.name) && (
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                  >
                    👁 Vorschau
                  </a>
                )}
                <a
                  href={node.url}
                  download={node.name}
                  className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors font-medium"
                  onClick={async (e) => {
                    e.preventDefault()
                    try {
                      const res = await fetch(node.url)
                      const blob = await res.blob()
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = node.name
                      a.click()
                    } catch {
                      window.open(node.url, '_blank')
                    }
                  }}
                >
                  ↓ Download
                </a>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FolderBrowser({
  title,
  files,
  onClose,
}: {
  title: string
  files: FileEntry[]
  onClose: () => void
}) {
  const [path, setPath] = useState<string[]>([])
  const tree = buildTree(files)

  function getAtPath(p: string[]): Record<string, TreeNode> {
    let current = tree
    for (const part of p) {
      const node = current[part]
      if (!node || node.type !== 'dir') return {}
      current = node.children
    }
    return current
  }

  const currentNodes = getAtPath(path)

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPath([])}
              className={`text-sm font-semibold transition-colors ${path.length === 0 ? 'text-gray-900' : 'text-teal-600 hover:text-teal-700'}`}
            >
              📁 {title}
            </button>
            {path.map((part, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-gray-300">/</span>
                <button
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className={`text-sm font-medium transition-colors ${i === path.length - 1 ? 'text-gray-900' : 'text-teal-600 hover:text-teal-700'}`}
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg ml-4 flex-shrink-0">✕</button>
        </div>

        {/* Back button */}
        {path.length > 0 && (
          <button
            onClick={() => setPath(path.slice(0, -1))}
            className="flex items-center gap-2 px-5 py-2 text-sm text-gray-500 hover:text-teal-600 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
          >
            ← Zurück
          </button>
        )}

        {/* File list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <TreeView nodes={currentNodes} path={path} onNavigate={setPath} />
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {files.length} Dateien insgesamt
        </div>
      </div>
    </div>
  )
}
