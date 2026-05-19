import { IObserver } from './IObserver';

export abstract class ISubject {
  abstract attach(observer: IObserver): void;
  abstract detach(observer: IObserver): void;
  abstract notify(event: string, data: Record<string, unknown>): void;
}

export const GroupEvents = {
  SOLICITUD_INGRESO: 'SOLICITUD_INGRESO',
  MIEMBRO_ACEPTADO: 'MIEMBRO_ACEPTADO',
  MIEMBRO_RECHAZADO: 'MIEMBRO_RECHAZADO',
  TRANSFERENCIA_ADMIN: 'TRANSFERENCIA_ADMIN',
  TRANSFERENCIA_ADMIN_SOLICITADA: 'TRANSFERENCIA_ADMIN_SOLICITADA',
  TRANSFERENCIA_ADMIN_ACEPTADA: 'TRANSFERENCIA_ADMIN_ACEPTADA',
  TRANSFERENCIA_ADMIN_RECHAZADA: 'TRANSFERENCIA_ADMIN_RECHAZADA',
  MENCION: 'MENCION'
} as const;

export type GroupEventType = typeof GroupEvents[keyof typeof GroupEvents];
