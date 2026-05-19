import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuthStore, getNotificationSeverity, SEVERITY_COLORS } from '@uniconnect/shared'
import { apiClient } from '../main'

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
    if (metaType === 'group_request') return ''
    if (metaType === 'request_accepted') return ''
    if (metaType === 'request_rejected') return ''
    if (metaType === 'admin_transfer' || metaType === 'admin_transfer_requested') return ''
    if (metaType === 'admin_transfer_accepted') return ''
    if (metaType === 'admin_transfer_rejected') return ''
    return '👥'
  }
  if (type === 'chat') return '💬'
  if (type === 'event') return '📅'
  return '🔔'
}

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { notifications, unreadCount, markRead, markAllRead, reload } = useNotifications()
  const [open, setOpen] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<Record<string, string>>({})
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

  const handleAdminTransferAction = useCallback(async (n: any, action: 'accept' | 'reject') => {
    const groupId = n.metadata?.groupId as string | undefined
    if (!groupId || !user?.uid) return
    setActingId(n.id)
    setActionError(prev => ({ ...prev, [n.id]: '' }))
    try {
      await apiClient.getAxiosInstance().post(`/api/groups/${groupId}/transfer-admin/response`, {
        candidateId: user.uid,
        action,
      })

      // Cerrar dropdown PRIMERO para evitar DOM conflicts con markRead
      setOpen(false)

      // Deferir markRead hasta después de que el dropdown se desmonte
      requestAnimationFrame(() => {
        markRead(n.id)
      })

      if (action === 'accept') {
        navigate(`/groups/${groupId}`)
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.error || ''
      setActionError(prev => ({ ...prev, [n.id]: msg || `No se pudo ${action === 'accept' ? 'aceptar' : 'rechazar'} la transferencia` }))
    } finally {
      setActingId(null)
    }
  }, [user?.uid, markRead, navigate])

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
                const colors = SEVERITY_COLORS[severity]

                return (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-l-4"
                    style={{
                      borderLeftColor: colors.border,
                      backgroundColor: isUnread ? colors.bg : undefined,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {notifIcon(n.type, metaType)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleNotifClick(n.id, groupId)}
                            className={`text-sm text-left ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}
                          >
                            {n.title}
                          </button>
                          {severity !== 'low' && (
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {severity === 'high' ? 'URGENTE' : 'IMPORTANTE'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {relativeTime(n.createdAt)}
                          </p>
                          {metaType === 'group_request' && groupId && (
                            <button
                              onClick={() => handleNotifClick(n.id, groupId)}
                              className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                            >
                              Ver solicitudes →
                            </button>
                          )}
                        </div>

                        {/* Admin transfer action buttons */}
                        {(metaType === 'admin_transfer' || metaType === 'admin_transfer_requested') && groupId && (
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAdminTransferAction(n, 'accept') }}
                                disabled={actingId === n.id}
                                className="flex-1 py-1.5 text-xs bg-[#002344] text-white rounded-lg hover:bg-[#002344]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {actingId === n.id ? (
                                  <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Procesando...
                                  </>
                                ) : (
                                  <>✓ Aceptar</>
                                )}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAdminTransferAction(n, 'reject') }}
                                disabled={actingId === n.id}
                                className="flex-1 py-1.5 text-xs border border-[#dc2626] text-[#dc2626] rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {actingId === n.id ? '...' : '✗ Rechazar'}
                              </button>
                            </div>
                            {actionError[n.id] && (
                              <p className="text-xs text-red-600 dark:text-red-400">{actionError[n.id]}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {isUnread && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: colors.icon }}
                        />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
