import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@uniconnect/shared'
import { apiClient } from '../main'
import { useNotifSocket } from '../context/SocketContext'
import { db } from '../lib/firestore'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  metadata: { groupId?: string; type?: string; [key: string]: unknown }
  type: string
  status: 'read' | 'unread'
  createdAt: string
}

const GROUP_NOTIF_TYPES = ['group_request', 'request_accepted', 'request_rejected']

const FRIENDLY_TYPES: Record<string, string> = {
  'SOLICITUD_INGRESO': 'group_request',
  'TRANSFERENCIA_ADMIN_SOLICITADA': 'admin_transfer_requested',
  'MIEMBRO_ACEPTADO': 'request_accepted',
  'MIEMBRO_RECHAZADO': 'request_rejected',
  'TRANSFERENCIA_ADMIN': 'admin_transfer',
  'TRANSFERENCIA_ADMIN_ACEPTADA': 'admin_transfer_accepted',
  'TRANSFERENCIA_ADMIN_RECHAZADA': 'admin_transfer_rejected',
  'NUEVO_EVENTO': 'new_event',
}

const mapEventType = (rawType: string): string => {
  return FRIENDLY_TYPES[rawType] || rawType
}

export function useNotifications() {
  const { user } = useAuthStore()
  const notifSocket = useNotifSocket()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const load = useCallback(async () => {
    if (!user?.uid) return
    try {
      const res = await apiClient.getAxiosInstance().get<{ data: AppNotification[] }>(
        `/api/notifications/${user.uid}`
      )
      const mapped = (res.data?.data ?? []).map(n => ({
        ...n,
        metadata: {
          ...n.metadata,
          type: n.metadata?.type ? mapEventType(n.metadata.type) : n.metadata?.type,
        },
      }))
      setNotifications(mapped)
    } catch (err) {
      // Notification service puede fallar (cuota Firestore, etc.)
      // Silenciar errores 500 — el Firestore listener cubre el fallback
      const status = (err as any)?.response?.status
      if (status && status >= 500) {
        // Error del servidor — no loguear, usar fallback
      } else {
        console.warn('[useNotifications] Error loading notifications:', err)
      }
    }
  }, [user?.uid])

  // Fallback: Firestore listener para notificaciones que el notification service no persistió
  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'notifications'),
      where('targetUserId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreNotifs: AppNotification[] = snapshot.docs.map(doc => {
        const d = doc.data()
        const friendlyType = mapEventType(d.type || '')
        return {
          id: doc.id,
          userId: d.targetUserId || user.uid,
          title: d.groupName ?? 'Notificación',
          body: d.message || '',
          metadata: { groupId: d.groupId, type: friendlyType },
          type: 'group',
          status: d.read ? 'read' : 'unread',
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        }
      })

      setNotifications(prev => {
        if (prev.length === 0) return firestoreNotifs
        const existingIds = new Set(prev.map(n => n.id))
        const newFromFirestore = firestoreNotifs.filter(n => !existingIds.has(n.id))
        return newFromFirestore.length > 0 ? [...newFromFirestore, ...prev] : prev
      })
    }, (err) => {
      console.warn('[useNotifications] Firestore listener error:', err)
    })

    return () => unsub()
  }, [user?.uid])

  // Carga inicial + polling fallback
  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  // Tiempo real: escucha evento 'notification' del social-service (puerto 3003)
  // WebSocketNotificationObserver.js emite: io.to(userId).emit('notification', { type, groupId, groupName, message })
  useEffect(() => {
    if (!notifSocket) return

    const handleNotification = (data: { type: string; groupId?: string; groupName?: string; message: string }) => {
      const friendlyType = mapEventType(data.type)
      const newNotif: AppNotification = {
        id: `rt-${Date.now()}`,
        userId: user?.uid ?? '',
        title: data.groupName ?? 'Notificación',
        body: data.message,
        metadata: { groupId: data.groupId, type: friendlyType },
        type: 'group',
        status: 'unread',
        createdAt: new Date().toISOString(),
      }
      setNotifications(prev => {
        const exists = prev.some(n => n.metadata?.groupId === data.groupId && n.metadata?.type === friendlyType && n.status === 'unread')
        return exists ? prev : [newNotif, ...prev]
      })
    }

    notifSocket.on('notification', handleNotification)
    return () => { notifSocket.off('notification', handleNotification) }
  }, [notifSocket, user?.uid])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
    // Persistir a Firestore si es una notificación de Firestore (id no empieza con rt-)
    if (!id.startsWith('rt-')) {
      import('firebase/firestore').then(({ doc, updateDoc }) => {
        updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {})
      })
    }
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
    if (!user?.uid) return
    import('firebase/firestore').then(({ collection, query, where, getDocs, writeBatch }) => {
      const q = query(collection(db, 'notifications'), where('targetUserId', '==', user.uid), where('read', '==', false))
      getDocs(q).then(snap => {
        const batch = writeBatch(db)
        snap.docs.forEach(d => batch.update(d.ref, { read: true }))
        batch.commit().catch(() => {})
      }).catch(() => {})
    })
  }, [user?.uid])

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  const groupUnreadCount = notifications.filter(
    n => n.status === 'unread' && n.type === 'group' && GROUP_NOTIF_TYPES.includes(n.metadata?.type ?? '')
  ).length

  return { notifications, unreadCount, groupUnreadCount, markRead, markAllRead, reload: load }
}
