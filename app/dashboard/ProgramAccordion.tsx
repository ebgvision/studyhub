'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Module = {
  id: string
  name: string
  slug: string
  semester: number | null
  module_type: string
  code: string | null
}

type Program = {
  id: string
  name: string
  slug: string
  colleges: { name: string; city: string } | null
}

type ProgramModuleRow = {
  program_id: string
  modules: Module | Module[] | null
}

function getTypeLabel(module: Module): string {
  if (module.module_type === 'wahlpflicht') {
    if ((module.semester ?? 0) >= 6) return 'Wahlpflicht Vertiefung'
    return 'Wahlpflicht Intl. Competence'
  }
  if (module.module_type === 'basis') return 'Basismodul'
  if (module.module_type === 'spezifisch') return 'Studiengangsspezifisch'
  return module.module_type
}

const TYPE_BADGE: Record<string, string> = {
  basis: 'bg-gray-100 text-gray-500',
  wahlpflicht: 'bg-blue-100 text-blue-600',
  spezifisch: 'bg-teal-100 text-teal-700',
}

const TYPE_CARD: Record<string, string> = {
  basis: 'border-gray-100 bg-white hover:border-teal-300 hover:shadow-sm',
  wahlpflicht: 'border-blue-100 bg-blue-50 hover:border-blue-400 hover:shadow-sm',
  spezifisch: 'border-teal-100 bg-teal-50 hover:border-teal-400 hover:shadow-sm',
}

export default function ProgramAccordion({
  programs,
  programModules,
  userId,
  initialFavoriteIds,
}: {
  programs: Program[]
  programModules: any[]
  userId: string
  initialFavoriteIds: string[]
}) {
  const [openPrograms, setOpenPrograms] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'semester' | 'alpha'>('semester')
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  async function toggleFav(module: Module) {
    const isFav = favoriteIds.includes(module.id)
    if (isFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== module.id))
      await supabase.from('module_favorites').delete().eq('user_id', userId).eq('module_id', module.id)
    } else {
      setFavoriteIds((prev) => [...prev, module.id])
      await supabase.from('module_favorites').insert({ user_id: userId, module_id: module.id })
    }
  }
  const [openSemesters, setOpenSemesters] = useState<Record<string, Set<number>>>({})

  function toggleProgram(programId: string) {
    setOpenPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    )
  }

  function toggleSemester(programId: string, semester: number) {
    setOpenSemesters((prev) => {
      const current = new Set(prev[programId] ?? [])
      if (current.has(semester)) {
        current.delete(semester)
      } else {
        current.add(semester)
      }
      return { ...prev, [programId]: current }
    })
  }

  function isSemesterOpen(programId: string, semester: number) {
    return openSemesters[programId]?.has(semester) ?? true // default open
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => {
        const isOpen = openPrograms.includes(program.id)

        const allModules = (programModules || [])
          .filter((pm: any) => pm.program_id === program.id)
          .flatMap((pm: any) => {
            if (!pm.modules) return []
            if (Array.isArray(pm.modules)) return pm.modules
            return [pm.modules]
          }) as Module[]

        const query = search.trim().toLowerCase()
        const filtered = query
          ? allModules.filter(
              (m) =>
                m.name.toLowerCase().includes(query) ||
                (m.code ?? '').toLowerCase().includes(query)
            )
          : allModules

        const sorted = [...filtered].sort((a, b) => {
          if (sortBy === 'alpha') return a.name.localeCompare(b.name, 'de')
          const semDiff = (a.semester ?? 99) - (b.semester ?? 99)
          if (semDiff !== 0) return semDiff
          return a.name.localeCompare(b.name, 'de')
        })

        // Semester-Gruppen
        const semesterGroups: Record<number, Module[]> = {}
        sorted.forEach((m) => {
          const sem = m.semester ?? 0
          if (!semesterGroups[sem]) semesterGroups[sem] = []
          semesterGroups[sem].push(m)
        })
        const semesters = Object.keys(semesterGroups).map(Number).sort((a, b) => a - b)

        return (
          <div key={program.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Programm-Header */}
            <button
              onClick={() => toggleProgram(program.id)}
              className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="w-3 h-3 bg-teal-500 rounded-full flex-shrink-0"></span>
              <span className="text-base font-bold text-gray-900 flex-1">{program.name}</span>
              <span className="text-xs text-gray-400 mr-3">{allModules.length} Module</span>
              <svg
                width="20" height="20"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Controls */}
                <div className="px-6 pt-4 pb-3 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <svg
                      width="16" height="16"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      className="text-gray-400"
                    >
                      <circle cx="11" cy="11" r="6" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Modul suchen (Name oder Code)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">×</button>
                    )}
                  </div>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden self-start">
                    <button
                      onClick={() => setSortBy('semester')}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${sortBy === 'semester' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      Nach Semester
                    </button>
                    <button
                      onClick={() => setSortBy('alpha')}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${sortBy === 'alpha' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      A – Z
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {sorted.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Kein Modul gefunden für „{search}"</div>
                  ) : sortBy === 'semester' ? (
                    // Semester-Gruppen mit Auf/Zuklappen
                    semesters.map((sem) => {
                      const semOpen = isSemesterOpen(program.id, sem)
                      const semModules = semesterGroups[sem]
                      return (
                        <div key={sem} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleSemester(program.id, sem)}
                            className="w-full px-4 py-2.5 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                          >
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex-1">
                              {sem === 0 ? 'Kein Semester' : `${sem}. Semester`}
                              <span className="ml-2 font-normal text-gray-400">({semModules.length})</span>
                            </span>
                            <svg
                              width="14" height="14"
                              style={{ transform: semOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              className="text-gray-400"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {semOpen && (
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {semModules.map((module) => (
                                <ModuleCard key={module.id} module={module} isFav={favoriteIds.includes(module.id)} onToggleFav={() => toggleFav(module)} />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    // A-Z: flache Liste
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sorted.map((module) => (
                        <ModuleCard key={module.id} module={module} isFav={favoriteIds.includes(module.id)} onToggleFav={() => toggleFav(module)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ModuleCard({ module, isFav, onToggleFav }: { module: Module; isFav: boolean; onToggleFav: () => void }) {
  const type = module.module_type as keyof typeof TYPE_CARD
  const cardStyle = TYPE_CARD[type] ?? TYPE_CARD.basis

  return (
    <div className={`rounded-xl p-3 border transition-all group flex flex-col gap-1.5 relative ${cardStyle}`}>
      {/* Stern-Button */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleFav() }}
        className={`absolute top-2 right-2 text-sm transition-colors ${isFav ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
        title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      >
        ★
      </button>

      <Link href={`/modules/${module.slug}`} className="flex flex-col gap-1.5 flex-1 pr-5">
        <div className="flex items-center gap-2">
          {module.code && (
            <span className="text-xs font-bold text-gray-500 font-mono tracking-wide">{module.code}</span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[type] ?? TYPE_BADGE.basis}`}>
            {getTypeLabel(module)}
          </span>
        </div>
        <div className="font-medium text-sm leading-snug text-gray-900 group-hover:text-teal-600 transition-colors">
          {module.name}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span />
          <span className="text-xs text-gray-300 group-hover:text-teal-400 transition-colors">→</span>
        </div>
      </Link>
    </div>
  )
}
