const ChatSubject = require('../../../src/application/observer/ChatSubject').default;
const { ChatEvents } = require('../../../src/domain/observer/ISubject');

describe('ChatSubject.js - Pruebas del patrón Observer', () => {
  let observer1;
  let observer2;

  beforeEach(() => {
    ChatSubject.observers = []; 
    observer1 = { update: jest.fn() };
    observer2 = { update: jest.fn() };
  });

  test('Criterio 1: Dado un Subject con 2 observers suscritos, cuando se llama notify(), entonces ambos observers reciben el evento', async () => {
    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    await ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).toHaveBeenCalledTimes(1);
    expect(observer1.update).toHaveBeenCalledWith('mensaje_enviado', { contenido: 'Hola mundo' });
    expect(observer2.update).toHaveBeenCalledTimes(1);
    expect(observer2.update).toHaveBeenCalledWith('mensaje_enviado', { contenido: 'Hola mundo' });
  });

  test('Criterio 2: Dado un observer que se desuscribe, cuando el subject notifica, entonces ese observer ya no recibe el evento', async () => {
    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    ChatSubject.detach(observer1);
    await ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).not.toHaveBeenCalled();
    expect(observer2.update).toHaveBeenCalledTimes(1);
  });

  test('Criterio 3: Dado que un observer lanza excepción, cuando el subject notifica, entonces los demás observers siguen recibiendo el evento (aislamiento de errores)', async () => {
    observer1.update.mockImplementation(() => {
      throw new Error('Error simulado en observer');
    });

    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    await ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).toHaveBeenCalledTimes(1);
    expect(observer2.update).toHaveBeenCalledTimes(1); 
  });

  test('Criterio 4: Las pruebas usan mocks/stubs para los observers', async () => {
    const mockObserver = { update: jest.fn() };
    ChatSubject.attach(mockObserver);
    
    await ChatSubject.notify(ChatEvents.NUEVO_MENSAJE, { data: 'test' });
    
    expect(mockObserver.update).toHaveBeenCalledTimes(1);
    expect(mockObserver.update).toHaveBeenCalledWith(ChatEvents.NUEVO_MENSAJE, { data: 'test' });
  });

  test('Criterio 5: Caso limite de registrar un observador ya existente', () => {
    ChatSubject.attach(observer1);
    ChatSubject.attach(observer1); // Duplicado
    expect(ChatSubject.observers).toHaveLength(1);
  });

  test('Criterio 6: Caso limite de remover un observador que no existe', () => {
    ChatSubject.attach(observer1);
    ChatSubject.detach(observer2); // No existe
    expect(ChatSubject.observers).toHaveLength(1);
  });

  test('Criterio 7: Caso limite de capturar excepcion no heredada de Error en notify', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    observer1.update.mockImplementation(() => {
      throw "Error string simulado"; // Excepcion no tipo Error
    });

    ChatSubject.attach(observer1);
    await ChatSubject.notify('mensaje_enviado', { contenido: 'Hola' });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error en el observer: Error string simulado');
    consoleSpy.mockRestore();
  });
});