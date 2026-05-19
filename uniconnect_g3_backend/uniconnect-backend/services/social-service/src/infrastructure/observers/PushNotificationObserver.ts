import { IObserver } from '../../domain/observer/IObserver';
import { GroupEvents } from '../../domain/observer/ISubject';
import { IPushNotificationData, IPushNotificationRequest } from '../../domain/observer/NotificationContracts';
import axios from 'axios';

export class PushNotificationObserver extends IObserver {
  private notificationServiceUrl: string;

  constructor(notificationServiceUrl: string) {
    super();
    this.notificationServiceUrl = notificationServiceUrl;
  }

  async update(event: string, data: IPushNotificationData): Promise<void> {
    console.log(`[PushNotificationObserver] Recibido evento ${event}`);

    try {
      // Mapear eventos de Social Service a eventos de Notification Service
      if (event === GroupEvents.SOLICITUD_INGRESO) {
        await this._sendToNotificationService('SOLICITUD_INGRESO', data);
      } else if (event === GroupEvents.MENCION) {
        await this._sendToNotificationService('MENCION', data);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_SOLICITADA || event === 'ADMIN_TRANSFER_REQUESTED') {
        // Mapeamos el ID del candidato como targetUserId para la push personal
        const mappedData: IPushNotificationData = { 
          ...data, 
          targetUserId: data.targetUserId || data.candidateId 
        };
        await this._sendToNotificationService('TRANSFER_ADMIN_SOLICITADA', mappedData);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_ACEPTADA || event === 'ADMIN_TRANSFER_COMPLETED') {
        await this._sendToNotificationService('TRANSFER_ADMIN_ACEPTADA', data);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_RECHAZADA || event === 'ADMIN_TRANSFER_REJECTED') {
        await this._sendToNotificationService('TRANSFER_ADMIN_RECHAZADA', data);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[PushNotificationObserver] Error al enviar notificación push:', error.message);
      } else {
        console.error('[PushNotificationObserver] Error desconocido al enviar notificación push');
      }
    }
  }

  private async _sendToNotificationService(event: string, payload: IPushNotificationData): Promise<void> {
    const url = `${this.notificationServiceUrl}/notify`;
    const requestBody: IPushNotificationRequest = { event, payload };
    await axios.post(url, requestBody);
    console.log(`[PushNotificationObserver] Notificación enviada exitosamente para evento ${event}`);
  }
}

export default PushNotificationObserver;

