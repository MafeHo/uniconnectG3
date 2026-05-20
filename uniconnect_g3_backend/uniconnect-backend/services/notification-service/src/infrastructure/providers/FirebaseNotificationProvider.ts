import * as admin from 'firebase-admin';
import { INotificationProvider } from '../../domain/services/INotificationProvider';

export class FirebaseNotificationProvider implements INotificationProvider {
  private admin: typeof admin;

  constructor(adminInstance: typeof admin) {
    this.admin = adminInstance;
  }

  async sendPush(token: string, title: string, body: string, data: Record<string, unknown> = {}): Promise<string> {
    const message = {
      notification: {
        title,
        body,
      },
      data: this._stringifyData(data),
      token: token,
    };

    try {
      const response = await this.admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error: unknown) {
      console.error('Error sending push notification:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'messaging/registration-token-not-registered') {
        console.warn(`Token ${token} is no longer valid.`);
      }
      throw error;
    }
  }

  async sendPushToMultiple(tokens: string[], title: string, body: string, data: Record<string, unknown> = {}): Promise<admin.messaging.BatchResponse | undefined> {
    if (!tokens || tokens.length === 0) return undefined;

    const message = {
      notification: {
        title,
        body,
      },
      data: this._stringifyData(data),
      tokens: tokens,
    };

    try {
      const response = await this.admin.messaging().sendEachForMulticast(message);
      console.log(`${response.successCount} messages were sent successfully`);
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  private _stringifyData(data: Record<string, unknown>): Record<string, string> {
    const stringified: Record<string, string> = {};
    for (const key in data) {
      if (typeof data[key] !== 'string') {
        stringified[key] = JSON.stringify(data[key]);
      } else {
        stringified[key] = data[key] as string;
      }
    }
    return stringified;
  }
}
