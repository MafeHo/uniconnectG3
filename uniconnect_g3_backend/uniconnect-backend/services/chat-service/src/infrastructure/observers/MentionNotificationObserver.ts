import { IObserver } from '../../domain/observer/IObserver';
import { ChatEvents } from '../../domain/observer/ISubject';
import * as http from 'http';
import * as admin from 'firebase-admin';

interface NuevoMensajePayload {
  groupId: string;
  message: {
    message_id: string;
    content: string;
    sender: { id: string };
    metadata?: {
      menciones?: string[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export class MentionNotificationObserver implements IObserver {
  private db: admin.firestore.Firestore;
  private notificationServiceUrl: string;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
  }

  async update(event: string, data: Record<string, unknown>): Promise<void> {
    if (event !== ChatEvents.NUEVO_MENSAJE) return;

    const payload = data as unknown as NuevoMensajePayload;
    const { groupId, message } = payload;
    const mentions = (message.metadata?.menciones || []) as string[];

    if (mentions.length === 0) return;

    try {
      console.log(`[MentionNotificationObserver] Procesando ${mentions.length} menciones para el mensaje ${message.message_id}`);

      const groupDoc = await this.db.collection('groups').doc(groupId).get();
      const groupData = groupDoc.exists ? groupDoc.data() || {} : {};
      const groupName = groupData.name || 'un grupo';
      
      const senderDoc = await this.db.collection('users').doc(message.sender.id).get();
      const senderData = senderDoc.exists ? senderDoc.data() || {} : {};
      const senderName = senderData.name || senderData.displayName || 'Alguien';

      for (const userId of mentions) {
        if (userId === message.sender.id) continue;

        console.log(`[MentionNotificationObserver] Notificando mención a userId: ${userId}`);
        this.triggerNotification(userId, {
          senderName,
          groupName,
          message: message.content,
          groupId: groupId
        });
      }
    } catch (error) {
      console.error('[MentionNotificationObserver] Error procesando menciones:', error);
    }
  }

  private triggerNotification(userId: string, payload: Record<string, unknown>): void {
    const postData = JSON.stringify({
      event: 'MENCION',
      payload: {
        userId,
        ...payload
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(`${this.notificationServiceUrl}/notify`, options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          console.error(`[MentionNotificationObserver] Error en NotificationService (${res.statusCode}):`, responseBody);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`[MentionNotificationObserver] Fallo al conectar con NotificationService: ${e.message}`);
    });

    req.write(postData);
    req.end();
  }
}
