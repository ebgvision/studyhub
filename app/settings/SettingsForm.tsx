'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsForm({
  userId,
  isAnonymous: initialIsAnonymous,
}: {
  userId: string
  isAnonymous: boolean
}) {
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ is_anonymous: isAnonymous }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Privatsphäre</h2>

      {/* Anonymitäts-Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-900">Anonym auftreten</div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Wenn aktiviert, wird dein Benutzername im Live-Chat und bei Kommentaren für andere als <span className="font-medium text-gray-700">„Anonym"</span> angezeigt. Deine Uploads bleiben trotzdem sichtbar.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setIsAnonymous(prev => !prev)}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${isAnonymous ? 'bg-teal-600' : 'bg-gray-200'}`}
          role="switch"
          aria-checked={isAnonymous}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className={`text-xs px-3 py-2 rounded-lg ${isAnonymous ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-500'}`}>
        {isAnonymous
          ? '🙈 Du bist aktuell anonym — andere sehen deinen Namen nicht.'
          : '👤 Du bist aktuell sichtbar — andere sehen deinen Benutzernamen.'}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Speichert...' : saved ? '✓ Gespeichert' : 'Einstellungen speichern'}
      </button>
    </div>
  )
}
