const PersistenciaNotificacionObserver = require('../../src/infrastructure/observers/PersistenciaNotificacionObserver').default;

describe('PersistenciaNotificacionObserver Unit Tests', () => {
  let mockDb;
  let mockCollection;
  let mockAdd;
  let observer;

  beforeEach(() => {
    mockAdd = jest.fn().mockResolvedValue({ id: 'mock-notif-id' });
    mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
    mockDb = { collection: mockCollection };

    observer = new PersistenciaNotificacionObserver(mockDb);
  });

  it('debe registrar y estructurar correctamente una notificación para SOLICITUD_INGRESO', async () => {
    const data = {
      priority: 'urgente',
      targetUserId: 'user-123',
      groupId: 'group-456',
      groupName: 'El Grupo',
      userName: 'Pepito',
      requestId: 'req-789'
    };

    await observer.update('SOLICITUD_INGRESO', data);

    expect(mockCollection).toHaveBeenCalledWith('notifications');
    expect(mockAdd).toHaveBeenCalled();
    const notification = mockAdd.mock.calls[0][0];
    expect(notification.type).toBe('group_request');
    expect(notification.targetUserId).toBe('user-123');
    expect(notification.priority).toBe('urgente');
    expect(notification.priorityWeight).toBe(2);
    expect(notification.message).toContain('Pepito');
    expect(notification.message).toContain('El Grupo');
  });

  it('debe registrar y estructurar correctamente una notificación para TRANSFERENCIA_ADMIN', async () => {
    const data = {
      priority: 'critica',
      userId: 'user-789',
      groupId: 'group-101',
      groupName: 'Grupo Admin'
    };

    await observer.update('TRANSFERENCIA_ADMIN', data);

    expect(mockCollection).toHaveBeenCalledWith('notifications');
    expect(mockAdd).toHaveBeenCalled();
    const notification = mockAdd.mock.calls[0][0];
    expect(notification.type).toBe('group_update');
    expect(notification.targetUserId).toBe('user-789');
    expect(notification.priority).toBe('critica');
    expect(notification.priorityWeight).toBe(3);
    expect(notification.message).toContain('Grupo Admin');
  });

  it('debe generar los mensajes correctos para cada evento en generateMessage', () => {
    expect(observer.generateMessage('MIEMBRO_ACEPTADO', { groupName: 'A' })).toContain('aceptado');
    expect(observer.generateMessage('MIEMBRO_RECHAZADO', { groupName: 'A' })).toContain('rechazada');
    expect(observer.generateMessage('TRANSFERENCIA_ADMIN_SOLICITADA', { groupName: 'A', userName: 'B' })).toContain('solicitado');
    expect(observer.generateMessage('ADMIN_TRANSFER_COMPLETED', { groupName: 'A', userName: 'B' })).toContain('aceptado');
    expect(observer.generateMessage('TRANSFERENCIA_ADMIN_RECHAZADA', { groupName: 'A', userName: 'B' })).toContain('rechazado');
    expect(observer.generateMessage('NOTIFICACION_SISTEMA', { type: 'group_request_accepted', groupName: 'A' })).toContain('aceptada');
    expect(observer.generateMessage('NOTIFICACION_SISTEMA', { message: 'Hola' })).toBe('Hola');
    expect(observer.generateMessage('UNKNOWN_EVENT', { groupName: 'A' })).toContain('Nueva notificación');
  });

  it('debe manejar errores sin propagarlos al llamador de forma resiliente', async () => {
    mockCollection.mockImplementation(() => {
      throw new Error('Firestore Error');
    });

    await expect(observer.update('SOLICITUD_INGRESO', {})).resolves.not.toThrow();
  });
});
