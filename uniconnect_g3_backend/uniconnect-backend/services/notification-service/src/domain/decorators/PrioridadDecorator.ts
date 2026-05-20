import { NotificacionDecorator } from './NotificacionDecorator';
import { INotificacion, INotificacionDTO } from '../entities/INotificacion';

export class PrioridadDecorator extends NotificacionDecorator {
  private priority: string;

  constructor(notificacion: INotificacion, priority: string) {
    super(notificacion);
    const allowedPriorities = ['normal', 'urgente', 'critica'];
    if (!allowedPriorities.includes(priority)) {
      throw new Error(`Prioridad no válida. Valores permitidos: ${allowedPriorities.join(', ')}`);
    }
    this.priority = priority;
  }

  getDTO(): INotificacionDTO {
    const dto = super.getDTO();
    const weights: Record<string, number> = { critica: 3, urgente: 2, normal: 1 };
    return {
      ...dto,
      priority: this.priority,
      priorityWeight: weights[this.priority] || 1
    };
  }
}
