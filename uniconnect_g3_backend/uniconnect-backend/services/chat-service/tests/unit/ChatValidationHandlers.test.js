const { BaseHandler } = require('../../src/application/validations/BaseHandler');
const { ValidarCamposHandler } = require('../../src/application/validations/ValidarCamposHandler');
const { ValidarContenidoHandler } = require('../../src/application/validations/ValidarContenidoHandler');
const { ValidarTamanoHandler } = require('../../src/application/validations/ValidarTamanoHandler');
const { ValidarPermisosHandler } = require('../../src/application/validations/ValidarPermisosHandler');
const { ValidarPermisosPrivadoHandler } = require('../../src/application/validations/ValidarPermisosPrivadoHandler');
const { ValidarMencionesHandler } = require('../../src/application/validations/ValidarMencionesHandler');
const { ValidarMencionesPrivadoHandler } = require('../../src/application/validations/ValidarMencionesPrivadoHandler');

describe('Chat Validation Handlers (CoR) - Pruebas Unitarias Aisladas', () => {
  let mockNextHandler;

  beforeEach(() => {
    // 1. Aislamiento de la Cadena: Mockeamos el siguiente handler en todos los tests
    mockNextHandler = {
      manejar: jest.fn().mockImplementation(async (req) => {
        return {
          esValido: true,
          error: null,
          codigo: 'OK',
          mensaje: req.mensajeDecorado || req.mensaje || req.text
        };
      })
    };
  });

  describe('1. BaseHandler', () => {
    let baseHandler;

    beforeEach(() => {
      baseHandler = new BaseHandler();
    });

    it('debe encadenar correctamente al siguiente handler con setSiguiente', () => {
      const returnedHandler = baseHandler.setSiguiente(mockNextHandler);
      expect(baseHandler.siguiente).toBe(mockNextHandler);
      expect(returnedHandler).toBe(mockNextHandler); // Retorna el handler para encadenamiento fluido
    });

    it('debe propagar la llamada al siguiente eslabón si existe', async () => {
      baseHandler.setSiguiente(mockNextHandler);
      const req = { text: 'Test' };
      const res = await baseHandler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(mockNextHandler.manejar).toHaveBeenCalledWith(req);
      expect(res.esValido).toBe(true);
    });

    it('debe retornar éxito por defecto al llegar al final de la cadena (siguiente = null)', async () => {
      const req = { text: 'Test' };
      const res = await baseHandler.manejar(req);

      expect(res).toEqual({
        esValido: true,
        error: null,
        codigo: 'OK',
        mensaje: undefined
      });
    });

    it('debe formatear errores de validación correctamente con retornarError()', () => {
      const err = baseHandler.retornarError('Mensaje ofensivo', 'OFFENSIVE_CONTENT');
      expect(err).toEqual({
        esValido: false,
        error: 'Mensaje ofensivo',
        codigo: 'OFFENSIVE_CONTENT'
      });
    });
  });

  describe('2. ValidarCamposHandler', () => {
    let handler;

    beforeEach(() => {
      handler = new ValidarCamposHandler();
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar la cadena si contiene texto no vacío', async () => {
      const req = { text: 'Hola Mundo' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe continuar la cadena si contiene un archivo adjunto sin texto', async () => {
      const req = { file: { name: 'document.pdf', size: 2048 } };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper la cadena si no contiene texto ni archivo adjunto', async () => {
      const req = {};
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'El mensaje debe contener texto o un archivo adjunto.',
        codigo: 'MISSING_CONTENT'
      });
    });

    it('debe romper la cadena si el texto solo contiene espacios vacíos', async () => {
      const req = { text: '   ' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res.esValido).toBe(false);
      expect(res.codigo).toBe('MISSING_CONTENT');
    });
  });

  describe('3. ValidarContenidoHandler', () => {
    let handler;

    beforeEach(() => {
      handler = new ValidarContenidoHandler();
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar la cadena si el mensaje es limpio', async () => {
      const req = { text: 'Buenos días a todos!' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper la cadena e informar si contiene palabras prohibidas (groserías/spam)', async () => {
      const req = { text: 'Este mensaje es puro SPAM!' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'El mensaje contiene palabras prohibidas o contenido ofensivo.',
        codigo: 'OFFENSIVE_CONTENT'
      });
    });

    it('debe ser insensible a mayúsculas/minúsculas al buscar palabras prohibidas', async () => {
      const req = { text: 'Un texto con una GrOsErÍa detectada' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res.esValido).toBe(false);
      expect(res.codigo).toBe('OFFENSIVE_CONTENT');
    });

    it('debe continuar la cadena si no posee texto (ej. mensaje sólo con archivo)', async () => {
      const req = { file: { name: 'img.png' } };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });
  });

  describe('4. ValidarTamanoHandler', () => {
    let handler;

    beforeEach(() => {
      handler = new ValidarTamanoHandler(10); // maxSize de 10 caracteres para pruebas rápidas
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar si el tamaño de texto es menor o igual al límite', async () => {
      const req = { text: '1234567890' }; // Exactamente 10
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper la cadena si el tamaño de texto excede el límite', async () => {
      const req = { text: '12345678901' }; // 11 caracteres
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'El mensaje excede el límite de caracteres permitido',
        codigo: 'MESSAGE_TOO_LONG'
      });
    });

    it('debe validar sobre mensaje decorado reconociendo metadatos de archivo adjunto', async () => {
      // Si no hay texto, pero mensajeDecorado tiene getMetadata() retornando archivo
      const mockDecorated = {
        getMetadata: () => ({ archivo: { url: 'http://bucket/file.pdf' } })
      };
      const req = { text: '', mensajeDecorado: mockDecorated };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper si no hay texto ni metadatos de archivo en el mensaje decorado', async () => {
      const req = { text: '' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'El mensaje no puede estar vacío',
        codigo: 'MESSAGE_EMPTY'
      });
    });
  });

  describe('5. ValidarPermisosHandler (Grupos)', () => {
    let handler;
    let mockGroupMemberRepo;

    beforeEach(() => {
      mockGroupMemberRepo = {
        isMember: jest.fn().mockResolvedValue(true)
      };
      handler = new ValidarPermisosHandler(mockGroupMemberRepo);
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar si el usuario pertenece al grupo', async () => {
      const req = { groupId: 'group-1', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockGroupMemberRepo.isMember).toHaveBeenCalledWith('group-1', 'user-1');
      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper la cadena con FORBIDDEN_MEMBER si el usuario no pertenece al grupo', async () => {
      mockGroupMemberRepo.isMember.mockResolvedValue(false);
      const req = { groupId: 'group-1', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'No tienes permiso para enviar mensajes en este grupo.',
        codigo: 'FORBIDDEN_MEMBER'
      });
    });

    it('debe romper la cadena con MISSING_IDS si falta groupId o senderId', async () => {
      const req = { groupId: 'group-1' }; // Falta senderId
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res.codigo).toBe('MISSING_IDS');
    });

    it('debe romper la cadena con INTERNAL_ERROR si el repositorio arroja una excepción', async () => {
      mockGroupMemberRepo.isMember.mockRejectedValue(new Error('Firestore error'));
      const req = { groupId: 'group-1', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'Error al verificar permisos del usuario.',
        codigo: 'INTERNAL_ERROR'
      });
    });
  });

  describe('6. ValidarPermisosPrivadoHandler (Chat Privado)', () => {
    let handler;
    let mockChatRepo;

    beforeEach(() => {
      mockChatRepo = {
        findById: jest.fn().mockResolvedValue({
          id: 'chat-1',
          participants: ['user-1', 'user-2']
        })
      };
      handler = new ValidarPermisosPrivadoHandler(mockChatRepo);
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar si el usuario es un participante del chat', async () => {
      const req = { chatId: 'chat-1', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockChatRepo.findById).toHaveBeenCalledWith('chat-1');
      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe continuar de forma fluida si el chat privado no existe aún (para permitir creación en demanda)', async () => {
      mockChatRepo.findById.mockResolvedValue(null);
      const req = { chatId: 'chat-new', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(res.esValido).toBe(true);
    });

    it('debe romper la cadena con FORBIDDEN_MEMBER si el usuario no es un participante del chat', async () => {
      const req = { chatId: 'chat-1', senderId: 'user-external' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'No tienes permiso para enviar mensajes en este chat privado.',
        codigo: 'FORBIDDEN_MEMBER'
      });
    });

    it('debe romper la cadena con MISSING_IDS si falta chatId o senderId', async () => {
      const req = { senderId: 'user-1' }; // Falta chatId
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res.codigo).toBe('MISSING_IDS');
    });

    it('debe romper la cadena con INTERNAL_ERROR si el repositorio arroja un fallo', async () => {
      mockChatRepo.findById.mockRejectedValue(new Error('Connection timeout'));
      const req = { chatId: 'chat-1', senderId: 'user-1' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).not.toHaveBeenCalled();
      expect(res).toEqual({
        esValido: false,
        error: 'Error al verificar permisos del usuario.',
        codigo: 'INTERNAL_ERROR'
      });
    });
  });

  describe('7. ValidarMencionesHandler (Grupos)', () => {
    let handler;
    let mockGroupMemberRepo;

    beforeEach(() => {
      mockGroupMemberRepo = {
        getGroupMembersWithNames: jest.fn().mockResolvedValue([
          { id: 'user-a', name: 'Alvaro Gomez' },
          { id: 'user-b', name: 'Beatriz Ruiz' }
        ])
      };
      handler = new ValidarMencionesHandler(mockGroupMemberRepo);
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar sin inyectar menciones si el texto no contiene menciones', async () => {
      const req = { text: 'Hola a todos en este grupo', groupId: 'group-1' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(req.mentions).toEqual([]);
      expect(res.esValido).toBe(true);
    });

    it('debe identificar menciones válidas y aplicar formateo HTML en renderedText e inyectar IDs', async () => {
      const req = { text: 'Hola @Alvaro y @Beatriz, favor revisar', groupId: 'group-1' };
      const res = await handler.manejar(req);

      expect(mockGroupMemberRepo.getGroupMembersWithNames).toHaveBeenCalledWith('group-1');
      expect(req.mentions).toEqual(['user-a', 'user-b']);
      expect(req.renderedText).toBe('Hola <span class="mention">@Alvaro Gomez</span> y <span class="mention">@Beatriz Ruiz</span>, favor revisar');
      expect(res.esValido).toBe(true);
    });

    it('debe ignorar menciones a nombres que no son miembros del grupo', async () => {
      const req = { text: 'Hola @Carlos', groupId: 'group-1' };
      const res = await handler.manejar(req);

      expect(req.mentions).toEqual([]);
      expect(req.renderedText).toBe('Hola @Carlos'); // Se mantiene igual
      expect(res.esValido).toBe(true);
    });

    it('debe continuar de forma fluida (resiliencia) aunque el repositorio falle, sin cortar la cadena', async () => {
      mockGroupMemberRepo.getGroupMembersWithNames.mockRejectedValue(new Error('DB Query crash'));
      const req = { text: 'Hola @Alvaro', groupId: 'group-1' };
      const res = await handler.manejar(req);

      // No rompe, continúa al siguiente handler
      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(req.mentions).toEqual([]);
      expect(req.renderedText).toBe('Hola @Alvaro'); // Sin alteración por fallo
      expect(res.esValido).toBe(true);
    });
  });

  describe('8. ValidarMencionesPrivadoHandler (Chat Privado)', () => {
    let handler;
    let mockChatRepo;

    beforeEach(() => {
      mockChatRepo = {
        findById: jest.fn().mockResolvedValue({
          id: 'chat-1',
          participants: ['user-sender', 'user-receiver']
        })
      };
      handler = new ValidarMencionesPrivadoHandler(mockChatRepo);
      handler.setSiguiente(mockNextHandler);
    });

    it('debe continuar sin menciones si el texto no tiene mención', async () => {
      const req = { text: 'Hola en privado', chatId: 'chat-1', senderId: 'user-sender' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(req.mentions).toEqual([]);
      expect(res.esValido).toBe(true);
    });

    it('debe formatear visualmente la mención y asignar mención al otro participante en chats 1:1', async () => {
      const req = { text: 'Hola @maria que tal', chatId: 'chat-1', senderId: 'user-sender' };
      const res = await handler.manejar(req);

      expect(mockChatRepo.findById).toHaveBeenCalledWith('chat-1');
      expect(req.mentions).toEqual(['user-receiver']); // Asume al receptor en 1:1
      expect(req.renderedText).toBe('Hola <span class="mention">@maria</span> que tal');
      expect(res.esValido).toBe(true);
    });

    it('debe continuar resilientemente sin romper la cadena si el chatRepo arroja un error', async () => {
      mockChatRepo.findById.mockRejectedValue(new Error('Firebase network error'));
      const req = { text: 'Hola @maria', chatId: 'chat-1', senderId: 'user-sender' };
      const res = await handler.manejar(req);

      expect(mockNextHandler.manejar).toHaveBeenCalledTimes(1);
      expect(req.mentions).toEqual([]);
      expect(req.renderedText).toBe('Hola @maria');
      expect(res.esValido).toBe(true);
    });
  });
});
