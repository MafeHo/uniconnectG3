import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload | string | Record<string, unknown>;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.uniconnect_token;

  if (!token) {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ 
      error: 'No autenticado', 
      code: 'NO_TOKEN',
      message: 'No se proveyó un token de sesión' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado', 
      code: 'INVALID_TOKEN',
      message: 'La sesión ha expirado o el token es incorrecto' 
    });
  }
};
export default authMiddleware;
