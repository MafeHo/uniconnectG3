import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { AuthController } from '../../../src/infrastructure/http/controllers/authController';
import { IUserRepository } from '../../../src/domain/repositories';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

jest.mock('firebase-admin', () => ({
  auth: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('Auth Controller', () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let controller: AuthController;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn()
    } as unknown as jest.Mocked<IUserRepository>;

    mockRes = {
      status: jest.fn<any>().mockReturnThis(),
      json: jest.fn<any>(),
      cookie: jest.fn<any>()
    };

    mockReq = {
      body: {}
    };

    controller = new AuthController(mockRepo);
    jest.clearAllMocks();
  });

  describe('checkSession', () => {
    test('Debe retornar 401 si no hay usuario en req', async () => {
      await controller.checkSession(mockReq as any, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    test('Debe retornar 404 si el usuario no existe en DB', async () => {
      mockReq.user = { uid: '123' };
      mockRepo.findById.mockResolvedValue(null);
      await controller.checkSession(mockReq as any, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('Debe retornar el usuario si existe', async () => {
      mockReq.user = { uid: '123' };
      const user = { uid: '123', name: 'Test', email: 'test@ucaldas.edu.co', lastLogin: new Date() };
      mockRepo.findById.mockResolvedValue(user);
      await controller.checkSession(mockReq as any, mockRes as Response);
      expect(mockRes.json).toHaveBeenCalledWith(user);
    });
  });

  describe('login', () => {
    test('Debe retornar 404 si el usuario no está en BD local', async () => {
      mockReq.body = { email: 'test@ucaldas.edu.co', password: 'password123' };
      
      const authMock = { getUserByEmail: jest.fn<any>().mockResolvedValue({ uid: '123' }) };
      (admin.auth as jest.Mock).mockReturnValue(authMock);
      
      mockRepo.findById.mockResolvedValue(null);

      await controller.login(mockReq as any, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('Debe hacer login correctamente y retornar cookie', async () => {
      mockReq.body = { email: 'test@ucaldas.edu.co', password: 'password123' };
      
      const authMock = { getUserByEmail: jest.fn<any>().mockResolvedValue({ uid: '123' }) };
      (admin.auth as jest.Mock).mockReturnValue(authMock);
      
      const user = { uid: '123', name: 'Test', email: 'test@ucaldas.edu.co', lastLogin: new Date() };
      mockRepo.findById.mockResolvedValue(user);
      
      (jwt.sign as jest.Mock).mockReturnValue('mocked_token');

      await controller.login(mockReq as any, mockRes as Response);
      
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('uniconnect_token', 'mocked_token', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({ user, token: 'mocked_token' });
    });
  });

  describe('register', () => {
    test('Debe fallar si el correo no es de @ucaldas.edu.co', async () => {
      mockReq.body = { email: 'test@gmail.com', password: 'password123', displayName: 'Test User' };
      await controller.register(mockReq as any, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Dominio de correo no permitido' });
    });

    test('Debe registrar y firmar token correctamente', async () => {
      mockReq.body = { email: 'test@ucaldas.edu.co', password: 'password123', displayName: 'Test User' };
      
      const authMock = { createUser: jest.fn<any>().mockResolvedValue({ uid: 'new123' }) };
      (admin.auth as jest.Mock).mockReturnValue(authMock);
      
      (jwt.sign as jest.Mock).mockReturnValue('mocked_token_new');

      await controller.register(mockReq as any, mockRes as Response);
      
      expect(mockRepo.save).toHaveBeenCalledWith('new123', expect.any(Object));
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mocked_token_new' }));
    });
  });
});
