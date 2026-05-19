import { INotificacionStrategy, StrategyResult } from '../strategies/INotificacionStrategy';
import { INotificacionDTO } from '../entities/INotificacion';

export interface LegacyNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  private strategies: INotificacionStrategy[];

  constructor(strategies: INotificacionStrategy[] = []) {
    this.strategies = strategies;
  }

  async notifyAll(payload: LegacyNotificationPayload, userPreferences: Record<string, unknown> = {}): Promise<{ success: { strategy: string; data: StrategyResult }[]; errors: { strategy: string; error: string }[] }> {
    const results: { success: { strategy: string; data: StrategyResult }[]; errors: { strategy: string; error: string }[] } = {
      success: [],
      errors: []
    };

    for (const strategy of this.strategies) {
      try {
        if (
          strategy.canal === 'push' &&
          userPreferences.pushEnabled === false
        ) {
          continue;
        }

        // Adapted to INotificacionDTO shape for strategy compatibility
        const adaptedNotification: INotificacionDTO = {
          userId: payload.token, // fallback
          title: payload.title,
          body: payload.body,
          metadata: payload.data || {},
          type: 'general',
          status: 'unread',
          priority: 'media',
          priorityWeight: 1,
          createdAt: new Date()
        };

        const res = await strategy.enviar(adaptedNotification);
        results.success.push({
          strategy: strategy.constructor.name,
          data: res
        });
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        results.errors.push({
          strategy: strategy.constructor.name,
          error: errMsg
        });
      }
    }

    return results;
  }
}