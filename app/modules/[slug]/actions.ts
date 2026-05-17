'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitStats(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt' }

  // Profil sicherstellen (falls Trigger nicht ausgeführt wurde)
  await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' })

  const moduleId = formData.get('module_id') as string
  const studyDays = parseInt(formData.get('study_days') as string)
  const gradeRaw = formData.get('grade') as string
  const grade = gradeRaw && gradeRaw !== '' ? parseFloat(gradeRaw) : null
  // 5.0 = nicht bestanden, alles andere = bestanden (wenn Note angegeben)
  const passed = grade !== null ? grade < 5.0 : true

  // Prüfen ob User schon eine Statistik für dieses Modul hat
  const { data: existing } = await supabase
    .from('module_stats')
    .select('id')
    .eq('module_id', moduleId)
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'Du hast bereits eine Statistik eingereicht.' }

  const { error } = await supabase.from('module_stats').insert({
    module_id: moduleId,
    user_id: user.id,
    study_days: studyDays,
    grade,
    passed,
  })

  if (error) return { error: error.message }

  revalidatePath(`/modules/${moduleId}`)
  return { success: true }
}
