import { Notification } from '../../domain/entities/Notification';
import { PrioridadDecorator } from '../../domain/decorators/PrioridadDecorator';
import { AccionDecorator } from '../../domain/decorators/AccionDecorator';
import NotificationRules from '../../domain/rules/NotificationRules';
import { INotificacionStrategy, StrategyResult } from '../../domain/strategies/INotificacionStrategy';
import { NotificationSchema } from '@uniconnect/api-types/dist/schemas/notification.schema';
import { INotificacion, INotificacionDTO } from '../../domain/entities/INotificacion';

export interface UserPreferences {
  userId: string;
  enabledChannels: Record<string, boolean>;
}

export interface IPreferenceRepository {
  getPreferences(userId: string): Promise<UserPreferences>;
}

export class SendNotification {
  private strategies: INotificacionStrategy[];
  private preferenceRepo: IPreferenceRepository;

  constructor(strategies: INotificacionStrategy[], preferenceRepo: IPreferenceRepository) {
    this.strategies = strategies;
    this.preferenceRepo = preferenceRepo;
  }

  async execute(notificationData: unknown): Promise<{ success: boolean; results: StrategyResult[]; notification: INotificacionDTO }> {
    const parsedData = NotificationSchema.parse(notificationData);
    
    console.log(`[Notification] Processing event for user ${parsedData.userId}: ${parsedData.title}`);

    try {
      const preferences = await this.preferenceRepo.getPreferences(parsedData.userId);
      const rule = NotificationRules[parsedData.type] || { priority: 'normal', requiresAction: false };

      let notificacion: INotificacion = new Notification({
        ...parsedData,
        status: 'unread',
        createdAt: new Date()
      });

      notificacion = new PrioridadDecorator(notificacion, rule.priority);

      if (rule.requiresAction) {
        const actionData = parsedData.action || {
          label: 'Ver Detalles',
          endpoint: '/default-endpoint',
          token: null
        };
        notificacion = new AccionDecorator(notificacion, actionData);
      } else if (parsedData.action) {
        notificacion = new AccionDecorator(notificacion, parsedData.action);
      }

      const finalDTO = notificacion.getDTO();
      const executionResults: StrategyResult[] = [];

      for (const strategy of this.strategies) {
        let isEnabled = preferences.enabledChannels[strategy.canal] ?? true;

        if (finalDTO.priority === 'critica') {
          console.log(`[Notification] OVERRIDE: Priority is critica. Forcing dispatch via ${strategy.canal}`);
          isEnabled = true;
        }

        if (!isEnabled) {
          console.log(`[Notification] Channel ${strategy.canal} is disabled for user ${parsedData.userId}. Skipping.`);
          continue;
        }

        try {
          const result = await strategy.enviar(finalDTO);
          executionResults.push(result);
        } catch (strategyError: unknown) {
          const errMsg = strategyError instanceof Error ? strategyError.message : String(strategyError);
          console.error(`[Notification] Critical failure in ${strategy.canal} strategy:`, errMsg);
          executionResults.push({
            canal: strategy.canal,
            enviado: false,
            error: 'ISOLATED_STRATEGY_FAILURE'
          });
        }
      }

      console.log(`[Notification] Processing complete for ${parsedData.userId}. Results: ${executionResults.length} channels processed.`);

      return {
        success: true,
        results: executionResults,
        notification: finalDTO
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[Notification] Error in strategy execution flow:', errMsg);
      throw new Error(`Notification sending failed: ${errMsg}`);
    }
  }
}
