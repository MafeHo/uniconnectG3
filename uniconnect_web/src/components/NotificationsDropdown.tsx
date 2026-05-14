import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { getNotificationSeverity, SEVERITY_COLORS } from '@uniconnect/shared'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

function notifIcon(type: string, metaType?: string): string {
  if (type === 'group') {
    if (metaType === 'group_request') return '🔔'
    if (metaType === 'request_accepted') return '✅'
    if (metaType === 'request_rejected') return '❌'
    return '👥'
  }
  if (type === 'chat') return '💬'
  if (type === 'event') return '📅'
  return '🔔'
}

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNotifClick = async (id: string, groupId?: string) => {
    await markRead(id)
    setOpen(false)
    if (groupId) navigate(`/groups/${groupId}`)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                Sin notificaciones
              </p>
            ) : (
              notifications.map(n => {
                const metaType = n.metadata?.type as string | undefined
                const groupId = n.metadata?.groupId as string | undefined
                const isUnread = n.status === 'unread'
                const severity = getNotificationSeverity(metaType)
                const severityColor = SEVERITY_COLORS[severity]

                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n.id, groupId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-l-4 ${
                      isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    style={{ borderLeftColor: severityColor.border }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {notifIcon(n.type, metaType)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {relativeTime(n.createdAt)}
                          </p>
                          {metaType === 'group_request' && groupId && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              Ver solicitudes →
                            </span>
                          )}
                        </div>
                      </div>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
