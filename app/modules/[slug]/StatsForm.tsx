'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitStats } from './actions'

export default function StatsForm({
  moduleId,
  hasSubmitted,
}: {
  moduleId: string
  hasSubmitted: boolean
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('module_id', moduleId)
    const result = await submitStats(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone(true)
      setOpen(false)
      router.refresh()
    }
  }

  if (done || hasSubmitted) {
    return (
      <p className="text-xs text-teal-600 font-medium mt-3">✅ Deine Statistik wurde eingereicht</p>
    )
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-gray-400 hover:text-teal-600 transition-colors underline underline-offset-2"
        >
          + Eigene Erfahrung anonym einreichen
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Lerntage</label>
              <input
                type="number"
                name="study_days"
                min={1} max={365} required
                placeholder="z.B. 14"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
              <select
                name="grade"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white"
              >
                <option value="">– keine –</option>
                {['1.0','1.3','1.7','2.0','2.3','2.7','3.0','3.3','3.7','4.0','5.0'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Wird gespeichert...' : 'Anonym einreichen'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
