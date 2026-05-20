import * as admin from 'firebase-admin';
import { INotificacionStrategy, StrategyResult } from '../../domain/strategies/INotificacionStrategy';
import { INotificacionDTO } from '../../domain/entities/INotificacion';

export class ResumenDiarioStrategy implements INotificacionStrategy {
  public canal: string;
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.canal = 'resumen_diario';
    this.db = db;
  }

  async enviar(notification: INotificacionDTO): Promise<StrategyResult> {
    try {
      if (!this.db) {
        throw new Error("Firestore DB instance is required");
      }

      const { userId, title, body, type } = notification;

      const bufferRef = this.db.collection('daily_buffer').doc(userId).collection('notifications');

      await bufferRef.add({
        title,
        body,
        type,
        timestamp: new Date().toISOString()
      });

      console.log(`[ResumenDiarioStrategy] 🕒 Notificación "${title}" guardada en daily_buffer para el usuario ${userId}.`);
      
      return { 
        success: true, 
        channel: 'resumen_diario',
        canal: this.canal, 
        enviado: true 
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[ResumenDiarioStrategy] Error:', errMsg);
      throw error;
    }
  }
}
