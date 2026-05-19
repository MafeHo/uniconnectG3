import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '@uniconnect/shared'
import { apiClient } from '../../main'
import { Calendar, Bell, BellOff } from 'lucide-react'
import type { Event, EventCategory } from '@uniconnect/shared'

const TYPE_COLORS: Record<string, string> = {
  'Cultural': '#b39055',
  'Deportivo': '#16a34a',
  'Académico': '#2563eb',
  'Social': '#7c3aed',
}

const getCategoryColor = (name: string): string => TYPE_COLORS[name] ?? '#6b7280'

const getCategoryBadgeClass = (type: string): string => {
  const map: Record<string, string> = {
    'Cultural': 'bg-[#b39055] text-white',
    'Deportivo': 'bg-green-500 text-white',
    'Académico': 'bg-blue-500 text-white',
    'Social': 'bg-purple-500 text-white',
  }
  return map[type] ?? 'bg-gray-500 text-white'
}

const formatEventDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface EventCardProps {
  event: Event
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
      {/* Imagen */}
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-[#002344] to-[#003355] flex items-center justify-center">
          <Calendar size={64} className="text-white/30" />
        </div>
      )}

      {/* Contenido */}
      <div className="p-5">
        {/* Badge de categoría */}
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${getCategoryBadgeClass(event.type ?? '')}`}>
          {event.type ?? 'General'}
        </span>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {event.title}
        </h3>

        {/* Fecha */}
        <div className="flex items-start gap-2 mb-2 text-gray-700">
          <span className="text-lg">📅</span>
          <span className="text-sm font-medium">{formatEventDate(event.date ?? '')}</span>
        </div>

        {/* Hora y duración */}
        {event.time && (
          <div className="flex items-start gap-2 mb-3 text-gray-700">
            <span className="text-lg">🕐</span>
            <span className="text-sm font-medium">
              {event.time}
              {event.duration && ` (${event.duration})`}
            </span>
          </div>
        )}

        {/* Ubicación */}
        {event.location && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2 text-gray-800">
              <span className="text-lg">📍</span>
              <span className="text-sm font-semibold">{event.location}</span>
            </div>
          </div>
        )}

        {/* Descripción */}
        {event.description && (
          <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar datos iniciales (categorías, eventos, suscripciones) — una sola vez
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      setLoading(true)
      try {
        const [catsRes, eventsRes, subsRes] = await Promise.all([
          apiClient.getAxiosInstance().get('/api/events/categories'),
          apiClient.getAxiosInstance().get('/api/events'),
          apiClient.getAxiosInstance().get(`/api/events/suscripciones/${user.uid}`),
        ])
        setCategories(catsRes.data ?? [])
        setEvents(eventsRes.data ?? [])
        setSubscribedCategories(subsRes.data ?? [])
      } catch (err) {
        console.error('Error cargando eventos:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.uid])

  const isSubscribed = (categoryId: string) => subscribedCategories.includes(categoryId)

  const handleToggleSubscription = async (categoryId: string) => {
    if (!user?.uid || submitting) return
    setSubmitting(true)
    try {
      if (isSubscribed(categoryId)) {
        await apiClient.getAxiosInstance().delete('/api/events/suscribir', {
          params: { userId: user.uid, categoryId }
        })
        setSubscribedCategories(prev => prev.filter(id => id !== categoryId))
      } else {
        await apiClient.getAxiosInstance().post('/api/events/suscribir', {
          userId: user.uid,
          categoryId
        })
        setSubscribedCategories(prev => [...prev, categoryId])
      }
    } catch (err) {
      console.error('Error toggling subscription:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Agrupar eventos por categoría — filtrado client-side por selectedCategory
  const eventsByCategory = useMemo(() => {
    const filtered = selectedCategory
      ? events.filter(e => e.type === selectedCategory)
      : events
    const groups: Record<string, Event[]> = {}
    filtered.forEach(event => {
      const type = event.type ?? 'General'
      if (!groups[type]) groups[type] = []
      groups[type].push(event)
    })
    return groups
  }, [events, selectedCategory])

  const getEventsByCategory = (categoryName: string) => eventsByCategory[categoryName] ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002344] mb-2">Explorar Eventos</h1>
        <p className="text-gray-600">Descubre lo que está pasando en la U de Caldas</p>
      </div>

      {/* Chips de categoría */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              !selectedCategory
                ? 'bg-[#002344] text-white border-[#002344]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#002344]'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-[#002344] text-white border-[#002344]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#002344]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002344] mb-4" />
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Calendar size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            {selectedCategory
              ? 'No hay eventos disponibles en esta categoría.'
              : 'No hay eventos próximos en este momento.'}
          </p>
        </div>
      )}

      {/* Secciones por categoría */}
      {!loading && Object.keys(eventsByCategory).sort().map(categoryName => {
        const categoryData = categories.find(c => c.name === categoryName)
        const categoryId = categoryData?.id
        const categoryEvents = getEventsByCategory(categoryName)

        if (categoryEvents.length === 0) return null

        return (
          <div key={categoryName} className="mb-10">
            {/* Header de categoría */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(categoryName) }}
                />
                <h2 className="text-lg font-extrabold text-[#002344] uppercase tracking-wider">
                  {categoryName}
                </h2>
              </div>

              {categoryId && (
                <button
                  onClick={() => handleToggleSubscription(categoryId)}
                  disabled={submitting}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    isSubscribed(categoryId)
                      ? 'border-[#b39055] text-[#b39055] hover:bg-[#b39055]/5'
                      : 'border-[#002344] text-[#002344] hover:bg-[#002344]/5'
                  }`}
                >
                  {isSubscribed(categoryId) ? (
                    <>
                      <BellOff size={14} />
                      ANULAR
                    </>
                  ) : (
                    <>
                      <Bell size={14} />
                      SUSCRIBIRSE
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Tarjetas de eventos */}
            {categoryEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
