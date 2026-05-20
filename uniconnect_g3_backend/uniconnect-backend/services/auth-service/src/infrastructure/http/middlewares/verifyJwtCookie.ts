import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedUser } from './authMiddleware';

export const verifyJwtCookie = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.uniconnect_token;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado', code: 'NO_TOKEN' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as DecodedUser;
    (req as Request & { user?: DecodedUser }).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', code: 'INVALID_TOKEN' });
  }
};
