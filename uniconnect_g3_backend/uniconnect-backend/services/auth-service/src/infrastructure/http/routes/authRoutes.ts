import express, { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { verifyJwtCookie } from '../middlewares/verifyJwtCookie';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middlewares/errorMiddleware';

interface PassportUser {
  uid: string;
  name: string;
  email: string;
}

export function createAuthRoutes(authController: AuthController): Router {
  const router = express.Router();

  // Iniciar flujo OAuth
  router.get('/google', (req, res, next) => {
    const redirectTarget = req.query.redirect as string | undefined;
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: redirectTarget,
      prompt: 'select_account'
    })(req, res, next);
  });

  // Callback de Google
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: Error | null, user: PassportUser | false | null, _info: unknown) => {
      const state = req.query.state as string | undefined; // 'web' o expoUrl

      if (err || !user) {
        if (state === 'web') {
          return res.redirect(`${process.env.DASHBOARD_URL}/auth/callback?error=domain_not_allowed`);
        }
        return res.redirect(`${state}?error=domain_not_allowed`);
      }

      // Generamos el JWT firmado tanto para Web como para Móvil.
      const token = jwt.sign(
        { uid: user.uid, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
      );

      if (state === 'web') {
        res.cookie('uniconnect_token', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(`${process.env.DASHBOARD_URL}/auth/callback?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&uid=${encodeURIComponent(user.uid)}`);
      }

      // Origen Móvil (state es la url de Expo ej: exp://...)
      res.redirect(`${state}?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&uid=${encodeURIComponent(user.uid)}`);
    })(req, res, next);
  });

  router.get('/me', verifyJwtCookie, asyncHandler((req: Request, res: Response) => authController.checkSession(req as AuthenticatedRequest, res)));

  router.post('/logout', (_req, res) => {
    res.clearCookie('uniconnect_token', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Sesión cerrada' });
  });

  // Nuevas rutas tradicionales con validación de Zod
  router.post('/login', asyncHandler((req: Request, res: Response) => authController.login(req, res)));
  router.post('/register', asyncHandler((req: Request, res: Response) => authController.register(req, res)));

  return router;
}
