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
  const [passed, setPassed] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('module_id', moduleId)
    formData.set('passed', String(passed))
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
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 text-sm text-teal-700 font-medium">
        ✅ Du hast deine Statistik bereits eingereicht — danke!
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors text-sm"
        >
          + Meine Erfahrung anonym einreichen
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900">Deine Erfahrung (anonym)</h4>

          {/* Lernzeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wie viele Tage hast du insgesamt gelernt?
            </label>
            <input
              type="number"
              name="study_days"
              min={1}
              max={365}
              required
              placeholder="z.B. 14"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welche Note hast du bekommen? (optional)
            </label>
            <select
              name="grade"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="">– keine Angabe –</option>
              {['1.0','1.3','1.7','2.0','2.3','2.7','3.0','3.3','3.7','4.0','5.0'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Bestanden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hast du bestanden?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPassed(true)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  passed === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                ✅ Bestanden
              </button>
              <button
                type="button"
                onClick={() => setPassed(false)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  passed === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                ❌ Nicht bestanden
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || passed === null}
              className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Wird gespeichert...' : 'Anonym einreichen'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
