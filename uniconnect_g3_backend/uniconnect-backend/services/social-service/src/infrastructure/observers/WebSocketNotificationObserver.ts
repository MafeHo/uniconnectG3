import { IObserver } from '../../domain/observer/IObserver';
import { Server } from 'socket.io';

export interface NotificationPayload {
  targetUserId?: string;
  groupId?: string;
  groupName?: string;
  newState?: string;
  candidateId?: string;
  userName?: string;
  [key: string]: unknown;
}

export class WebSocketNotificationObserver extends IObserver {
  private io: Server;

  constructor(io: Server) {
    super();
    this.io = io; // Instancia de Socket.io
  }

  update(event: string, data: NotificationPayload): void {
    try {
      if (!this.io) {
        console.warn('[Observer WebSocket] Socket server no inicializado.');
        return;
      }

      const groupEvents = ['ADMIN_TRANSFER_REQUESTED', 'ADMIN_TRANSFER_COMPLETED', 'ADMIN_TRANSFER_REJECTED', 'GROUP_LOCKED', 'GROUP_DISSOLVED'];

      if (groupEvents.includes(event)) {
        console.log(`[Observer WebSocket] Emitiendo tiempo real: ${event} a la sala del grupo: ${data.groupId}`);
        this.io.to(String(data.groupId || '')).emit('notification', {
          type: event,
          groupId: data.groupId,
          groupName: data.groupName || 'tu grupo',
          statusFriendlyName: data.newState,
          message: this.generateMessage(event, data)
        });

        // Notificación directa y personal al candidato si existe
        if (event === 'ADMIN_TRANSFER_REQUESTED' && data.candidateId) {
          console.log(`[Observer WebSocket] Emitiendo notificación personal directa al candidato: ${data.candidateId}`);
          this.io.to(data.candidateId).emit('notification', {
            type: 'TRANSFERENCIA_ADMIN_SOLICITADA',
            groupId: data.groupId,
            groupName: data.groupName || 'tu grupo',
            statusFriendlyName: data.newState,
            message: `Se te ha solicitado ser el administrador de ${data.groupName || 'tu grupo'}.`
          });
        }
      } else if (data.targetUserId) {
        console.log(`[Observer WebSocket] Emitiendo tiempo real: ${event} para el usuario: ${data.targetUserId}`);
        this.io.to(data.targetUserId).emit('notification', {
          type: event,
          groupId: data.groupId,
          groupName: data.groupName,
          statusFriendlyName: data.newState,
          message: this.generateMessage(event, data)
        });
      }
      
    } catch (error) {
      console.error('[Observer WebSocket] Error emitiendo notificación socket:', error);
    }
  }

  generateMessage(event: string, data: NotificationPayload): string {
    switch (event) {
      case 'SOLICITUD_INGRESO':
        return `${data.userName} quiere unirse a tu grupo ${data.groupName}.`;
      case 'MIEMBRO_ACEPTADO':
        return `Bienvenido al grupo ${data.groupName}!`;
      case 'MIEMBRO_RECHAZADO':
        return `Tu solicitud para ${data.groupName} no fue aprobada.`;
      case 'TRANSFERENCIA_ADMIN':
        return `Has sido nombrado administrador de ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_SOLICITADA':
        return `${data.userName || 'Alguien'} te ha solicitado ser el administrador del grupo ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_ACEPTADA':
        return `${data.userName || 'Alguien'} ha aceptado ser el administrador del grupo ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_RECHAZADA':
        return `${data.userName || 'Alguien'} ha rechazado la solicitud para ser administrador del grupo ${data.groupName}.`;
      case 'ADMIN_TRANSFER_REQUESTED':
        return `Se ha propuesto un nuevo administrador para ${data.groupName || 'el grupo'}.`;
      case 'ADMIN_TRANSFER_COMPLETED':
        return `La transferencia de administración en ${data.groupName || 'el grupo'} ha sido completada.`;
      case 'ADMIN_TRANSFER_REJECTED':
        return `La transferencia de administración en ${data.groupName || 'el grupo'} ha sido rechazada.`;
      case 'GROUP_LOCKED':
        return `El grupo ${data.groupName || 'actual'} ha sido bloqueado por razones administrativas.`;
      case 'GROUP_DISSOLVED':
        return `El grupo ${data.groupName || 'actual'} ha sido disuelto.`;
      default:
        return 'Tienes una nueva notificación.';
    }
  }
}
export default WebSocketNotificationObserver;
