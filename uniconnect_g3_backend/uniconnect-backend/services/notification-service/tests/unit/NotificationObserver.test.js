const NotificationObserver = require('../../src/application/observers/NotificationObserver');

describe('NotificationObserver - Pruebas Unitarias Exhaustivas', () => {
  let observer;
  let mockSendNotificationUseCase;

  beforeEach(() => {
    mockSendNotificationUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, notificationId: 'mock-id' }),
    };

    observer = new NotificationObserver(mockSendNotificationUseCase);
    jest.clearAllMocks();
  });

  describe('1. Inicialización y Acoplamiento', () => {
    it('debe instanciarse correctamente inyectando el caso de uso', () => {
      expect(observer).toBeInstanceOf(NotificationObserver);
      expect(observer.sendNotificationUseCase).toBe(mockSendNotificationUseCase);
    });
  });

  describe('2. Notificaciones de Chat (Menciones y Mensajes Privados)', () => {
    it('debe procesar una mención con los metadatos correctos', async () => {
      await observer.onMention(
        'user-1',
        'Carlos',
        'Ingeniería',
        'Revisa el PR',
        'group-1'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Mención en Ingeniería',
        body: 'Carlos te ha mencionado: "Revisa el PR"',
        metadata: { groupId: 'group-1', type: 'mention' },
        type: 'chat',
      });
    });

    it('debe procesar un mensaje privado con los metadatos correctos', async () => {
      await observer.onPrivateMessage(
        'user-2',
        'Ana',
        'Hola, ¿cómo estás?',
        'chat-2'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-2',
        title: 'Nuevo mensaje de Ana',
        body: 'Hola, ¿cómo estás?',
        metadata: { chatId: 'chat-2', type: 'private_message' },
        type: 'chat',
      });
    });
  });

  describe('3. Notificaciones de Grupo (Ingreso, Aceptación, Rechazo)', () => {
    it('debe procesar una solicitud de unión al grupo', async () => {
      await observer.onGroupRequest(
        'admin-1',
        'Juan',
        'Grupo de Tesis',
        'group-3'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'admin-1',
        title: 'Nueva solicitud de unión',
        body: 'Juan quiere unirse a tu grupo "Grupo de Tesis"',
        metadata: { groupId: 'group-3', type: 'group_request' },
        type: 'group',
      });
    });

    it('debe procesar cuando una solicitud de unión es ACEPTADA', async () => {
      await observer.onGroupRequestHandled(
        'user-3',
        true,
        'Grupo de Tesis',
        'group-3'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-3',
        title: '¡Solicitud aceptada!',
        body: 'Tu solicitud para unirte a "Grupo de Tesis" fue aceptada',
        metadata: { groupId: 'group-3', type: 'request_accepted' },
        type: 'group',
      });
    });

    it('debe procesar cuando una solicitud de unión es RECHAZADA', async () => {
      await observer.onGroupRequestHandled(
        'user-3',
        false,
        'Grupo de Tesis',
        'group-3'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-3',
        title: 'Solicitud rechazada',
        body: 'Tu solicitud para unirte a "Grupo de Tesis" fue rechazada',
        metadata: { groupId: 'group-3', type: 'request_rejected' },
        type: 'group',
      });
    });
  });

  describe('4. Transferencia de Administración (Flujos de Control)', () => {
    it('debe procesar una transferencia de administración directa', async () => {
      await observer.onAdminTransfer('user-4', 'Semillero IA', 'group-4');

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-4',
        title: 'Nuevo rol de Administrador',
        body: 'Ahora eres el administrador del grupo "Semillero IA"',
        metadata: { groupId: 'group-4', type: 'admin_transfer' },
        type: 'group',
      });
    });

    it('debe procesar una solicitud de transferencia de administración', async () => {
      await observer.onAdminTransferRequested(
        'user-4',
        'Santiago',
        'Semillero IA',
        'group-4'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-4',
        title: 'Solicitud de Administración',
        body: 'Santiago te ha solicitado ser el administrador del grupo "Semillero IA"',
        metadata: { groupId: 'group-4', type: 'admin_transfer_requested' },
        type: 'group',
      });
    });

    it('debe procesar cuando una transferencia de administración es ACEPTADA', async () => {
      await observer.onAdminTransferAccepted(
        'user-5',
        'María',
        'Semillero IA',
        'group-4'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-5',
        title: 'Transferencia de Administración Aceptada',
        body: 'María ha aceptado ser el administrador del grupo "Semillero IA"',
        metadata: { groupId: 'group-4', type: 'admin_transfer_accepted' },
        type: 'group',
      });
    });

    it('debe procesar cuando una transferencia de administración es RECHAZADA', async () => {
      await observer.onAdminTransferRejected(
        'user-5',
        'María',
        'Semillero IA',
        'group-4'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-5',
        title: 'Transferencia de Administración Rechazada',
        body: 'María ha rechazado la solicitud para ser administrador del grupo "Semillero IA"',
        metadata: { groupId: 'group-4', type: 'admin_transfer_rejected' },
        type: 'group',
      });
    });
  });

  describe('5. Notificaciones de Eventos', () => {
    it('debe procesar la creación de un nuevo evento correctamente', async () => {
      await observer.onNewEvent(
        'user-6',
        'Deportes',
        'Torneo de Fútbol 5',
        'event-6'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-6',
        title: 'Nuevo evento en Deportes',
        body: 'Torneo de Fútbol 5',
        metadata: { eventId: 'event-6', type: 'new_event' },
        type: 'event',
      });
    });
  });

  describe('6. Robustez y Manejo de Errores (Edge Cases)', () => {
    it('debe propagar la excepción adecuadamente si el caso de uso falla', async () => {
      mockSendNotificationUseCase.execute.mockRejectedValue(
        new Error('Database connectivity failed')
      );

      await expect(
        observer.onMention('user-1', 'Carlos', 'Software', 'Hola', 'grp-1')
      ).rejects.toThrow('Database connectivity failed');

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('debe tolerar datos incompletos o nulos sin romper la ejecución sincrónica (Edge Case)', async () => {
      // Caso donde algunos campos llegan como undefined o null
      await observer.onMention(
        undefined, 
        null, 
        'Grupo Especial', 
        undefined, 
        'grp-abc'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: undefined,
        title: 'Mención en Grupo Especial',
        body: 'null te ha mencionado: "undefined"',
        metadata: { groupId: 'grp-abc', type: 'mention' },
        type: 'chat',
      });
    });
  });
});