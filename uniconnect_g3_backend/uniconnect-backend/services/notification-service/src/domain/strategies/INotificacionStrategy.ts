import { INotificacionDTO } from '../entities/INotificacion';

export interface StrategyResult {
  canal: string;
  enviado: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface INotificacionStrategy {
  canal: string;
  enviar(notification: INotificacionDTO): Promise<StrategyResult>;
}
