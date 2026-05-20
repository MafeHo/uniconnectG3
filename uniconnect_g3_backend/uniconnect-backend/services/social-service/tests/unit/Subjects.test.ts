import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import studyGroupSubject from '../../src/application/observer/GrupoEstudioSubject';
import eventoUniversidadSubject from '../../src/application/observer/EventoUniversidadSubject';
import { IObserver } from '../../src/domain/observer/IObserver';
import { GroupEvents } from '../../src/domain/observer/ISubject';

describe('Subjects de Social Service (Observer Pattern)', () => {
  let mockObserver1: jest.Mocked<IObserver>;
  let mockObserver2: jest.Mocked<IObserver>;

  beforeEach(() => {
    // Resetear los observers privados usando casting a any
    (studyGroupSubject as any).observers = [];
    (eventoUniversidadSubject as any).observers = [];

    mockObserver1 = {
      update: jest.fn()
    } as unknown as jest.Mocked<IObserver>;

    mockObserver2 = {
      update: jest.fn()
    } as unknown as jest.Mocked<IObserver>;
  });

  describe('GrupoEstudioSubject', () => {
    test('Debe registrar, desregistrar y notificar observadores correctamente', () => {
      studyGroupSubject.attach(mockObserver1);
      studyGroupSubject.attach(mockObserver2);
      
      const eventData = { groupId: 'g1' };
      studyGroupSubject.notify(GroupEvents.SOLICITUD_INGRESO, eventData);

      expect(mockObserver1.update).toHaveBeenCalledWith(GroupEvents.SOLICITUD_INGRESO, eventData);
      expect(mockObserver2.update).toHaveBeenCalledWith(GroupEvents.SOLICITUD_INGRESO, eventData);

      studyGroupSubject.detach(mockObserver1);
      studyGroupSubject.notify(GroupEvents.TRANSFERENCIA_ADMIN, eventData);

      expect(mockObserver1.update).toHaveBeenCalledTimes(1); // No recibe la segunda notificación
      expect(mockObserver2.update).toHaveBeenCalledTimes(2);
    });

    test('Debe ignorar si se registra el mismo observador multiples veces (branch exists)', () => {
      studyGroupSubject.attach(mockObserver1);
      studyGroupSubject.attach(mockObserver1); // Duplicado

      expect((studyGroupSubject as any).observers).toHaveLength(1);
    });

    test('Debe ignorar si se intenta remover un observador que no existe (branch index === -1)', () => {
      studyGroupSubject.attach(mockObserver1);
      studyGroupSubject.detach(mockObserver2); // No registrado

      expect((studyGroupSubject as any).observers).toHaveLength(1);
    });

    test('Debe manejar notificacion con lista de observadores vacia', () => {
      expect(() => {
        studyGroupSubject.notify(GroupEvents.SOLICITUD_INGRESO, {});
      }).not.toThrow();
    });
  });

  describe('EventoUniversidadSubject', () => {
    test('Debe registrar, desregistrar y notificar observadores correctamente', () => {
      eventoUniversidadSubject.attach(mockObserver1);
      eventoUniversidadSubject.attach(mockObserver2);
      
      const eventData = { eventId: 'e1' };
      eventoUniversidadSubject.notify('NUEVO_EVENTO', eventData);

      expect(mockObserver1.update).toHaveBeenCalledWith('NUEVO_EVENTO', eventData);
      expect(mockObserver2.update).toHaveBeenCalledWith('NUEVO_EVENTO', eventData);

      eventoUniversidadSubject.detach(mockObserver1);
      eventoUniversidadSubject.notify('EVENTO_ACTUALIZADO', eventData);

      expect(mockObserver1.update).toHaveBeenCalledTimes(1);
      expect(mockObserver2.update).toHaveBeenCalledTimes(2);
    });

    test('Debe ignorar si se registra el mismo observador multiples veces', () => {
      eventoUniversidadSubject.attach(mockObserver1);
      eventoUniversidadSubject.attach(mockObserver1);

      expect((eventoUniversidadSubject as any).observers).toHaveLength(1);
    });

    test('Debe ignorar si se intenta remover un observador que no existe', () => {
      eventoUniversidadSubject.attach(mockObserver1);
      eventoUniversidadSubject.detach(mockObserver2);

      expect((eventoUniversidadSubject as any).observers).toHaveLength(1);
    });

    test('Debe manejar notificacion con lista de observadores vacia', () => {
      expect(() => {
        eventoUniversidadSubject.notify('NUEVO_EVENTO', {});
      }).not.toThrow();
    });
  });
});
