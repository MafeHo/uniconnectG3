import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '@uniconnect/shared'
import { apiClient, eventApi } from '../../main'
import { Calendar, Bell, BellOff } from 'lucide-react'
import type { Event, EventCategory } from '@uniconnect/shared'

const TYPE_COLORS: Record<string, string> = {
  'Cultural': '#b39055',
  'Deportivo': '#16a34a',
  'Académico': '#2563eb',
  'Social': '#7c3aed',
}

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
  categoryId: string | undefined
  isSubscribed: boolean
  onToggleSubscription: (categoryId: string) => void
  submitting: boolean
}

function EventCard({ event, categoryId, isSubscribed, onToggleSubscription, submitting }: EventCardProps) {
  const hasImage = !!event.imageUrl

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
      )}
      <div className="p-5">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${getCategoryBadgeClass(event.type ?? '')}`}>
          {event.type ?? 'General'}
        </span>
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{event.title}</h3>
        <div className="flex items-start gap-2 mb-2 text-gray-700">
          <Calendar size={18} />
          <span className="text-sm font-medium">{formatEventDate(event.date ?? '')}</span>
        </div>
        {event.time && (
          <div className="flex items-start gap-2 mb-3 text-gray-700">
            <span className="text-sm font-medium">
              {event.time}
              {event.duration && ` (${event.duration})`}
            </span>
          </div>
        )}
        {event.location && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm font-semibold text-gray-800">📍 {event.location}</p>
          </div>
        )}
        {event.description && (
          <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-3">{event.description}</p>
        )}

        {/* Subscribe button per card */}
        {categoryId && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onToggleSubscription(categoryId)}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isSubscribed
                  ? 'bg-[#b39055]/10 text-[#b39055] hover:bg-[#b39055]/20'
                  : 'bg-[#002344] text-white hover:bg-[#002344]/90'
              } disabled:opacity-50`}
            >
              {isSubscribed ? (
                <>
                  <BellOff size={14} />
                  Suscrito — Anular suscripción
                </>
              ) : (
                <>
                  <Bell size={14} />
                  Suscribirme a eventos {event.type?.toLowerCase() ?? ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventFeed() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar datos iniciales — una sola vez
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      setLoading(true)
      try {
        const [catsRes, eventsRes, subsRes] = await Promise.all([
          eventApi.getCategories(),
          eventApi.getEvents(),
          eventApi.getSubscribedCategories(user.uid),
        ])
        const cats = Array.isArray(catsRes) ? catsRes : (catsRes as any)?.data ?? []
        const evts = Array.isArray(eventsRes) ? eventsRes : (eventsRes as any)?.data ?? []
        const subs = Array.isArray(subsRes) ? subsRes : (subsRes as any)?.data ?? []
        setCategories(cats)
        setEvents(evts)
        setSubscribedCategories(subs)
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
        await eventApi.unsubscribeFromCategory(user.uid, categoryId)
        setSubscribedCategories(prev => prev.filter(id => id !== categoryId))
      } else {
        await eventApi.subscribeToCategory(user.uid, categoryId)
        setSubscribedCategories(prev => [...prev, categoryId])
      }
    } catch (err) {
      console.error('Error toggling subscription:', err)
    } finally {
      setSubmitting(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002344] mb-3" />
        <p className="text-gray-500 text-sm">Cargando eventos...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Calendar size={48} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-center text-sm">No hay eventos próximos en este momento.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Category chips */}
      <div className="w-full max-w-4xl mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
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

      {/* Events by category */}
      <div className="w-full max-w-4xl space-y-10">
        {Object.keys(eventsByCategory).sort().map(categoryName => {
          const categoryData = categories.find(c => c.name === categoryName)
          const categoryId = categoryData?.id
          const categoryEvents = eventsByCategory[categoryName]
          if (categoryEvents.length === 0) return null

          return (
            <div key={categoryName}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[categoryName] ?? '#6b7280' }}
                />
                <h2 className="text-base font-extrabold text-[#002344] uppercase tracking-wider">
                  {categoryName}
                </h2>
              </div>

              {/* Cards */}
              <div className="space-y-4">
                {categoryEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    categoryId={categoryId}
                    isSubscribed={categoryId ? isSubscribed(categoryId) : false}
                    onToggleSubscription={handleToggleSubscription}
                    submitting={submitting}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
