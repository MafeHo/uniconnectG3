import { IObserver } from '../../domain/observer/IObserver';
import * as admin from 'firebase-admin';

export class PersistenciaNotificacionObserver extends IObserver {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    super();
    this.db = db;
  }

  async update(event: string, data: Record<string, any>): Promise<void> {
    try {
      console.log(`[Observer Persistencia] Procesando evento: ${event}`);
      
      const priority = data.priority || 'normal';
      const priorityWeightMap: Record<string, number> = { critica: 3, urgente: 2, normal: 1 };
      const priorityWeight = priorityWeightMap[priority] || 1;

      const standardizedType = this._mapEventType(event);

      const targetUser = data.targetUserId || data.candidateId || data.userId;

      const notification = {
        type: standardizedType,
        targetUserId: targetUser,
        userId: targetUser, // Compatibility con notification-service
        groupId: data.groupId,
        groupName: data.groupName,
        message: this.generateMessage(event, data),
        status: 'unread', // Compatibility con notification-service
        priority: priority,
        priorityWeight: priorityWeight,
        metadata: {
          groupId: data.groupId,
          requestId: data.requestId || '',
          type: standardizedType
        },
        createdAt: new Date()
      };

      await this.db.collection('notifications').add(notification);
      console.log(`[Observer Persistencia] Notificación guardada en Firestore para el usuario: ${targetUser}`);
    } catch (error) {
      console.error('[Observer Persistencia] Error persistiendo notificación:', error);
    }
  }

  generateMessage(event: string, data: Record<string, unknown>): string {
    switch (event) {
      case 'SOLICITUD_INGRESO':
        return `${data.userName} ha solicitado unirse a tu grupo ${data.groupName}.`;
      case 'MIEMBRO_ACEPTADO':
        return `Has sido aceptado en el grupo ${data.groupName}.`;
      case 'MIEMBRO_RECHAZADO':
        return `Tu solicitud para el grupo ${data.groupName} ha sido rechazada.`;
      case 'TRANSFERENCIA_ADMIN':
        return `Ahora eres el administrador del grupo ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_SOLICITADA':
      case 'ADMIN_TRANSFER_REQUESTED':
        return `${data.userName || 'Un administrador'} te ha solicitado ser el administrador del grupo ${data.groupName || 'tu grupo'}.`;
      case 'TRANSFERENCIA_ADMIN_ACEPTADA':
      case 'ADMIN_TRANSFER_COMPLETED':
        return `${data.userName || 'Un administrador'} ha aceptado ser el administrador del grupo ${data.groupName || 'tu grupo'}.`;
      case 'TRANSFERENCIA_ADMIN_RECHAZADA':
      case 'ADMIN_TRANSFER_REJECTED':
        return `${data.userName || 'Un administrador'} ha rechazado ser el administrador del grupo ${data.groupName || 'tu grupo'}.`;
      case 'NOTIFICACION_SISTEMA':
        if (data.type === 'group_request_accepted') {
          return `Tu solicitud para unirte al grupo ${data.groupName || 'seleccionado'} ha sido aceptada.`;
        }
        return String(data.message || '') || `Notificación del sistema para el grupo ${String(data.groupName || 'seleccionado')}.`;
      case 'SESION_CREADA':
        return `Nueva sesión "${data.sessionTitle || 'sesión'}" programada en ${data.groupName || 'el grupo'}.`;
      case 'SESION_CANCELADA':
        return `La sesión "${data.sessionTitle || 'sesión'}" en ${data.groupName || 'el grupo'} fue cancelada.`;
      case 'DISPONIBILIDAD_ACTUALIZADA':
        return `${data.userName || 'Un participante'} actualizó su disponibilidad en ${data.groupName || 'el grupo'}.`;
      case 'RECORDATORIO_SESION':
        return `Recordatorio: La sesión "${data.sessionTitle || 'sesión'}" comienza pronto.`;
      default:
        return `Nueva notificación en el grupo ${String(data.groupName || 'desconocido')}.`;
    }
  }

  private _mapEventType(event: string): string {
    if (event === 'SOLICITUD_INGRESO') return 'group_request';
    if (event === 'NOTIFICACION_SISTEMA') return 'notification_system';
    if (event === 'SESION_CREADA' || event === 'SESION_CANCELADA') return 'session_update';
    if (event === 'DISPONIBILIDAD_ACTUALIZADA') return 'availability_update';
    if (event === 'RECORDATORIO_SESION') return 'session_reminder';
    return 'group_update';
  }
}
export default PersistenciaNotificacionObserver;
