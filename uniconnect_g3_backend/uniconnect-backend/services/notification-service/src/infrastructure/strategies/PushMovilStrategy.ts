import * as admin from 'firebase-admin';
import { INotificacionStrategy, StrategyResult } from '../../domain/strategies/INotificacionStrategy';
import { INotificacionDTO } from '../../domain/entities/INotificacion';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';

export class PushMovilStrategy implements INotificacionStrategy {
  public canal: string;
  private tokenRepo: ITokenRepository;

  constructor(tokenRepo: ITokenRepository) {
    this.tokenRepo = tokenRepo;
    this.canal = 'push';
  }

  async enviar(notification: INotificacionDTO): Promise<StrategyResult> {
    try {
      console.log(`[PushMovilStrategy] Fetching tokens for user ${notification.userId}`);
      const tokens = await this.tokenRepo.getTokensByUserId(notification.userId);

      if (!tokens || tokens.length === 0) {
        console.log(`[PushMovilStrategy] No tokens found for user ${notification.userId}. Skipping.`);
        return { canal: 'push', enviado: false, error: 'NO_TOKENS' };
      }

      const stringifiedData: Record<string, string> = {};
      if (notification.metadata) {
        Object.keys(notification.metadata).forEach(key => {
          stringifiedData[key] = String(notification.metadata[key]);
        });
      }

      stringifiedData.type = String(notification.type || 'general');

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringifiedData,
        tokens: tokens,
      };

      console.log(`[PushMovilStrategy] Sending real FCM multicast to ${tokens.length} tokens...`);
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`[PushMovilStrategy] FCM summary for ${notification.userId}: ${response.successCount} success, ${response.failureCount} failure.`);

      const invalidTokens: string[] = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            const token = tokens[idx];
            
            console.error(`[PushMovilStrategy] Delivery failed for token index ${idx}: ${error?.code}`);
            
            if (error?.code === 'messaging/invalid-registration-token' || 
                error?.code === 'messaging/registration-token-not-registered') {
              console.warn(`[PushMovilStrategy] Detected stale/invalid token for user ${notification.userId}`);
              invalidTokens.push(token);
              
              this.tokenRepo.removeToken(token).catch(err => {
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error('[PushMovilStrategy] Cleanup error:', errMsg);
              });
            }
          }
        });
      }

      return {
        canal: 'push',
        enviado: response.successCount > 0,
        detalles: {
          totalTokens: tokens.length,
          successCount: response.successCount,
          failureCount: response.failureCount,
          cleanedTokens: invalidTokens.length
        }
      };

    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[PushMovilStrategy] Critical Error in FCM logic:', errMsg);
      return {
        canal: 'push',
        enviado: false,
        error: errMsg
      };
    }
  }
}
