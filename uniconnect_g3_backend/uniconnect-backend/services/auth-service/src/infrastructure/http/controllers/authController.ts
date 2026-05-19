import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

import { LoginRequestSchema, RegisterRequestSchema } from '@uniconnect/api-types/dist/schemas/auth.schema';

export class AuthController {
  private userRepo: IUserRepository;

  constructor(userRepo: IUserRepository) {
    this.userRepo = userRepo;
  }

  async checkSession(req: AuthenticatedRequest, res: Response) {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const user = await this.userRepo.findById(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  }

  async login(req: Request, res: Response) {
    // Validate using LoginRequestSchema of Zod
    const validatedData = LoginRequestSchema.parse(req.body);

    try {
      // 3. Obtener el usuario de Firebase Auth por email
      const firebaseUser = await admin.auth().getUserByEmail(validatedData.email);

      // 4. Buscar en el repositorio local (Firestore)
      const user = await this.userRepo.findById(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ error: 'El usuario no está registrado en la base de datos' });
      }

      // 5. Firmar el token JWT
      const token = jwt.sign(
        { uid: user.uid, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
      );

      // 6. Configurar cookie (Web)
      res.cookie('uniconnect_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({ user, token });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      throw error;
    }
  }

  async register(req: Request, res: Response) {
    // Validate using RegisterRequestSchema of Zod
    const validatedData = RegisterRequestSchema.parse(req.body);

    // 3. Validar que el dominio sea @ucaldas.edu.co
    if (!validatedData.email.endsWith('@ucaldas.edu.co')) {
      return res.status(400).json({ error: 'Dominio de correo no permitido' });
    }

    try {
      // 4. Crear usuario en Firebase Auth
      const firebaseUser = await admin.auth().createUser({
        email: validatedData.email,
        password: validatedData.password,
        displayName: validatedData.displayName,
      });

      const userData = {
        uid: firebaseUser.uid,
        name: validatedData.displayName,
        email: validatedData.email,
        lastLogin: new Date(),
      };

      // 5. Guardar en el repositorio local (Firestore)
      await this.userRepo.save(firebaseUser.uid, userData);

      // 6. Firmar el token JWT
      const token = jwt.sign(
        { uid: firebaseUser.uid, name: userData.name, email: userData.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
      );

      // 7. Configurar cookie (Web)
      res.cookie('uniconnect_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({ user: userData, token });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
      throw error;
    }
  }
}
