import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '@uniconnect/shared'
import type { Group } from '@uniconnect/shared'
import { apiClient } from '../main'
import GroupCard from '../components/GroupCard'
import { Search, Filter, X } from 'lucide-react'
import Spinner from '../components/Spinner'

export default function SearchPage() {
  const { profile, profileLoaded } = useUserStore()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [pendingSubjectId, setPendingSubjectId] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Build subject map from profile's subjects
  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (profile?.subjects && profile?.subjectNames) {
      profile.subjects.forEach((id, index) => {
        map[id] = profile.subjectNames?.[index] ?? id
      })
    }
    return map
  }, [profile?.subjects, profile?.subjectNames])

  // Load groups for user's subjects
  useEffect(() => {
    const loadGroups = async () => {
      if (!profile?.subjects || profile.subjects.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Backend accepts userSubjectIds as comma-separated string
        const userSubjectIds = profile.subjects.join(',')
        const response = await apiClient.getAxiosInstance().get<Group[]>(
          `/api/groups?userSubjectIds=${userSubjectIds}`
        )
        const loadedGroups = response.data || []
        setGroups(loadedGroups)
      } catch (e: any) {
        console.error('Error loading groups:', e)
        setError('No se pudieron cargar los grupos')
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [profile?.subjects])

  // Filter groups locally
  const filteredGroups = useMemo(() => {
    let result = groups

    // Filter by selected subject
    if (selectedSubjectId !== 'all') {
      result = result.filter(g => g.subjectId === selectedSubjectId)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(g => {
        const groupName = g.name?.toLowerCase() || ''
        const subjectName = subjectMap[g.subjectId]?.toLowerCase() || ''
        return groupName.includes(query) || subjectName.includes(query)
      })
    }

    return result
  }, [groups, selectedSubjectId, searchQuery, subjectMap])

  // Waiting for profile to load — don't show "no subjects" prematurely
  if (!profileLoaded) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  // No subjects registered
  if (!loading && (!profile?.subjects || profile.subjects.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aún no tienes materias registradas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Para ver grupos de estudio, primero debes agregar las materias que estás cursando este semestre.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a mi perfil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buscar Grupos</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de grupo o materia..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Filtrar por materia</h3>
            <button
              onClick={() => {
                setShowFilters(false)
                setPendingSubjectId(selectedSubjectId) // Reset pending to current
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="subject"
                value="all"
                checked={pendingSubjectId === 'all'}
                onChange={() => setPendingSubjectId('all')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Todas las materias</span>
            </label>
            {profile?.subjects?.map((subjectId, index) => (
              <label key={subjectId} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="subject"
                  value={subjectId}
                  checked={pendingSubjectId === subjectId}
                  onChange={() => setPendingSubjectId(subjectId)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profile.subjectNames?.[index] ?? subjectId}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectedSubjectId(pendingSubjectId)
              setShowFilters(false)
            }}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Aplicar filtros
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* No groups for user's subjects */}
      {!loading && !error && groups.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No hay grupos disponibles para tus materias aún
          </p>
        </div>
      )}

      {/* No search results */}
      {!loading && !error && groups.length > 0 && filteredGroups.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron grupos que coincidan con tu búsqueda
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && filteredGroups.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredGroups.length} {filteredGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}
          </p>
          {filteredGroups.map(group => (
            <GroupCard 
              key={group.id} 
              group={group} 
              subjectName={subjectMap[group.subjectId]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
