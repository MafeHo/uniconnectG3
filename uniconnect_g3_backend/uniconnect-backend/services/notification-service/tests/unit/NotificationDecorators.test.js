const INotificacion = require('../../src/domain/entities/INotificacion');
const Notification = require('../../src/domain/entities/Notification');
const NotificacionDecorator = require('../../src/domain/decorators/NotificacionDecorator');
const PrioridadDecorator = require('../../src/domain/decorators/PrioridadDecorator');
const AccionDecorator = require('../../src/domain/decorators/AccionDecorator');

describe('Notification Decorators - Pruebas Unitarias', () => {
  let baseNotification;

  beforeEach(() => {
    baseNotification = new Notification({
      id: 'notif-123',
      userId: 'user-456',
      title: 'Título Base',
      body: 'Cuerpo Base',
      type: 'chat',
      metadata: { key: 'value' }
    });
  });

  describe('NotificacionDecorator (Decorador Base)', () => {
    it('debe lanzar un error si el objeto envuelto no hereda de INotificacion', () => {
      expect(() => {
        new NotificacionDecorator({});
      }).toThrow('El objeto debe implementar INotificacion');
    });

    it('debe heredar de INotificacion y delegar correctamente getDTO() al objeto envuelto', () => {
      const decorator = new NotificacionDecorator(baseNotification);
      expect(decorator).toBeInstanceOf(INotificacion);
      expect(decorator.getDTO()).toEqual(baseNotification.getDTO());
    });
  });

  describe('PrioridadDecorator', () => {
    it('debe lanzar un error si se especifica una prioridad inválida o no soportada', () => {
      expect(() => {
        new PrioridadDecorator(baseNotification, 'super-urgente');
      }).toThrow('Prioridad no válida. Valores permitidos: normal, urgente, critica');
    });

    it('debe asignar la prioridad y retornar el peso correcto para prioridad "critica"', () => {
      const decorator = new PrioridadDecorator(baseNotification, 'critica');
      const dto = decorator.getDTO();

      expect(dto.priority).toBe('critica');
      expect(dto.priorityWeight).toBe(3);
      expect(dto.userId).toBe('user-456'); // Preserva campos base
    });

    it('debe asignar la prioridad y retornar el peso correcto para prioridad "urgente"', () => {
      const decorator = new PrioridadDecorator(baseNotification, 'urgente');
      const dto = decorator.getDTO();

      expect(dto.priority).toBe('urgente');
      expect(dto.priorityWeight).toBe(2);
    });

    it('debe asignar la prioridad y retornar el peso correcto para prioridad "normal"', () => {
      const decorator = new PrioridadDecorator(baseNotification, 'normal');
      const dto = decorator.getDTO();

      expect(dto.priority).toBe('normal');
      expect(dto.priorityWeight).toBe(1);
    });
  });

  describe('AccionDecorator', () => {
    it('debe lanzar un error si la acción es nula, indefinida o incompleta', () => {
      expect(() => {
        new AccionDecorator(baseNotification, null);
      }).toThrow('El objeto action debe tener la estructura { label: string, endpoint: string }');

      expect(() => {
        new AccionDecorator(baseNotification, { label: 'Click' }); // Falta endpoint
      }).toThrow('El objeto action debe tener la estructura { label: string, endpoint: string }');

      expect(() => {
        new AccionDecorator(baseNotification, { endpoint: '/home' }); // Falta label
      }).toThrow('El objeto action debe tener la estructura { label: string, endpoint: string }');
    });

    it('debe asignar correctamente las propiedades de la acción', () => {
      const actionPayload = {
        label: 'Ver Mensaje',
        endpoint: '/chats/123',
        token: 'token-seguro'
      };

      const decorator = new AccionDecorator(baseNotification, actionPayload);
      const dto = decorator.getDTO();

      expect(dto.action).toEqual({
        label: 'Ver Mensaje',
        endpoint: '/chats/123',
        token: 'token-seguro'
      });
      expect(dto.title).toBe('Título Base'); // Preserva campos base
    });

    it('debe inicializar el token de acción como nulo si no es proveído', () => {
      const actionPayload = {
        label: 'Ver Mensaje',
        endpoint: '/chats/123'
      };

      const decorator = new AccionDecorator(baseNotification, actionPayload);
      const dto = decorator.getDTO();

      expect(dto.action.token).toBeNull();
    });
  });

  describe('Composición de Decoradores (Nested wrapping)', () => {
    it('debe permitir aplicar múltiples decoradores en cascada de forma transparente', () => {
      // 1. Aplicamos prioridad urgente
      const prioritized = new PrioridadDecorator(baseNotification, 'urgente');
      
      // 2. Aplicamos acción interactiva sobre el objeto prioritario
      const actionPayload = {
        label: 'Revisar Solicitud',
        endpoint: '/groups/requests'
      };
      const fullyDecorated = new AccionDecorator(prioritized, actionPayload);

      // 3. Obtenemos el DTO resultante
      const dto = fullyDecorated.getDTO();

      // Debe conservar las decoraciones de ambos decoradores y los datos de la notificación base
      expect(dto.userId).toBe('user-456');
      expect(dto.title).toBe('Título Base');
      expect(dto.priority).toBe('urgente');
      expect(dto.priorityWeight).toBe(2);
      expect(dto.action).toEqual({
        label: 'Revisar Solicitud',
        endpoint: '/groups/requests',
        token: null
      });
    });
  });
});
