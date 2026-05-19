import { INotificacionStrategy, StrategyResult } from '../../domain/strategies/INotificacionStrategy';
import { INotificacionDTO } from '../../domain/entities/INotificacion';
import { INotificationRepository } from '../../application/use-cases/MarkNotificationAsRead';
import { Server } from 'socket.io';

export class InAppWebSocketStrategy implements INotificacionStrategy {
  public canal: string;
  private notificationRepo: INotificationRepository;
  private io: Server;

  constructor(notificationRepo: INotificationRepository, io: Server) {
    this.canal = 'in_app';
    this.notificationRepo = notificationRepo;
    this.io = io;
  }

  async enviar(notification: INotificacionDTO): Promise<StrategyResult> {
    try {
      console.log(`[InAppWebSocketStrategy] Persisting notification for user ${notification.userId}`);
      
      const data = notification;
      const result = await this.notificationRepo.save(data);
      
      if (this.io) {
        console.log(`[InAppWebSocketStrategy] Emitting socket to user room: ${data.userId}`);
        this.io.to(data.userId).emit('notification', {
          id: result,
          ...data
        });
      }
      
      return {
        canal: this.canal,
        enviado: true,
        id: result
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[InAppWebSocketStrategy] Error:', errMsg);
      return {
        canal: this.canal,
        enviado: false,
        error: errMsg
      };
    }
  }
}
