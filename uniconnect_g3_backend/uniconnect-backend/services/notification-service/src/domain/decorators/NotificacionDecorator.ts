import { INotificacion, INotificacionDTO } from '../entities/INotificacion';

export class NotificacionDecorator extends INotificacion {
  protected notificacion: INotificacion;

  constructor(notificacion: INotificacion) {
    super();
    if (!(notificacion instanceof INotificacion)) {
      throw new Error("El objeto debe implementar INotificacion");
    }
    this.notificacion = notificacion;
  }

  getDTO(): INotificacionDTO {
    return this.notificacion.getDTO();
  }
}
