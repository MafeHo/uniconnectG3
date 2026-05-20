import { IObserver } from './IObserver';

export interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(event: string, data: Record<string, unknown>): Promise<void> | void;
}

export const ChatEvents = {
  NUEVO_MENSAJE: 'NUEVO_MENSAJE',
  MENSAJE_PRIVADO: 'MENSAJE_PRIVADO',
  ENCUESTA_ACTUALIZADA: 'ENCUESTA_ACTUALIZADA',
  ENCUESTA_CERRADA: 'ENCUESTA_CERRADA'
} as const;

export type ChatEventType = typeof ChatEvents[keyof typeof ChatEvents];
