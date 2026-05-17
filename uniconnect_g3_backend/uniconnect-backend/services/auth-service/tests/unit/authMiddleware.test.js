const { authMiddleware } = require('../../src/infrastructure/http/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware - Unidad', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      cookies: {},
      headers: {
        authorization: 'Bearer mock-token'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('debería retornar 401 si no hay token en cookies ni en el header', () => {
    mockReq.headers.authorization = undefined;
    mockReq.cookies.uniconnect_token = undefined;

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      error: 'No autenticado', 
      code: 'NO_TOKEN',
      message: 'No se proveyó un token de sesión' 
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el token no tiene el formato correcto (sin Bearer)', () => {
    mockReq.headers.authorization = 'InvalidTokenFormat';

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      error: 'No autenticado', 
      code: 'NO_TOKEN',
      message: 'No se proveyó un token de sesión' 
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería llamar a next() si el token es válido usando JWT', () => {
    const mockDecodedToken = { uid: 'user_123', email: 'test@ucaldas.edu.co' };
    
    jwt.verify.mockReturnValue(mockDecodedToken);

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockDecodedToken);
    expect(mockNext).toHaveBeenCalled();
  });

  it('debería retornar 401 si la verificación del JWT falla o expira', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('JsonWebTokenError: invalid signature');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      error: 'Token inválido o expirado', 
      code: 'INVALID_TOKEN',
      message: 'La sesión ha expirado o el token es incorrecto' 
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});