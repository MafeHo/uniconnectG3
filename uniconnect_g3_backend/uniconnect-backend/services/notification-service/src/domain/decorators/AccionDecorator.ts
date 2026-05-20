import { NotificacionDecorator } from './NotificacionDecorator';
import { INotificacion, INotificacionDTO } from '../entities/INotificacion';

interface ActionParams {
  label: string;
  endpoint: string;
  token?: string | null;
}

export class AccionDecorator extends NotificacionDecorator {
  private action: ActionParams;

  constructor(notificacion: INotificacion, action: ActionParams) {
    super(notificacion);
    if (!action || typeof action.label !== 'string' || typeof action.endpoint !== 'string') {
      throw new Error("El objeto action debe tener la estructura { label: string, endpoint: string }");
    }
    this.action = {
      label: action.label,
      endpoint: action.endpoint,
      token: action.token || null
    };
  }

  getDTO(): INotificacionDTO {
    const dto = super.getDTO();
    return {
      ...dto,
      action: this.action
    };
  }
}
