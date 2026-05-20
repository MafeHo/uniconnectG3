import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DecodedUser {
  uid: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest {
  cookies?: {
    uniconnect_token?: string;
    [key: string]: string | undefined;
  };
  user?: DecodedUser;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Intentar obtener el token de las cookies (Web)
  let token = req.cookies?.uniconnect_token;

  // 2. Si no hay cookie, intentar obtenerlo del header Authorization (Móvil)
  if (!token) {
    const authHeader = (req.headers?.authorization || req.headers?.Authorization) as string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  // 3. Si no se encontró en ninguna parte, retornar 401 Unauthorized estandarizado
  if (!token) {
    return res.status(401).json({ 
      error: 'No autenticado', 
      code: 'NO_TOKEN',
      message: 'No se proveyó un token de sesión' 
    });
  }

  // 4. Verificar el JWT usando la misma firma para Web y Móvil
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as DecodedUser;
    (req as Request & { user?: DecodedUser }).user = decoded; // Adjuntar payload decodificado al req.user
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado', 
      code: 'INVALID_TOKEN',
      message: 'La sesión ha expirado o el token es incorrecto' 
    });
  }
};
