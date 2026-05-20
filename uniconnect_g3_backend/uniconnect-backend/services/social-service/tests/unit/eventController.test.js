const { EventController } = require('../../src/infrastructure/http/controllers/eventController');

describe('EventController - Pruebas Unitarias', () => {
  let controller;
  let mockCreateEventUC;
  let req;
  let res;

  beforeEach(() => {
    mockCreateEventUC = {
      execute: jest.fn(),
    };

    controller = new EventController({
      createEvent: mockCreateEventUC,
      getEvents: jest.fn(),
      getCategories: jest.fn(),
      subscribeToCategory: jest.fn(),
      unsubscribeFromCategory: jest.fn(),
      getSubscribedCategories: jest.fn(),
    });

    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('debe retornar error si faltan parámetros obligatorios', async () => {
    req.body = {
      title: 'Taller de Software 3',
    };
    const next = jest.fn();

    await controller.createEvent(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.name).toBe('ZodError');
    expect(mockCreateEventUC.execute).not.toHaveBeenCalled();
  });

  it('debe llamar al caso de uso createEvent correctamente', async () => {
    req.body = {
      title: 'Taller de Software 3',
      description: 'Revisión de proyectos',
      date: '2026-05-15T10:00:00Z',
      location: 'Aula Virtual',
      organizerId: 'org-456',
      categoryId: 'cat-academia'
    };

    const mockEvent = { id: 'evento-123', ...req.body };
    mockCreateEventUC.execute.mockResolvedValue(mockEvent);

    await controller.createEvent(req, res);

    expect(mockCreateEventUC.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });
});