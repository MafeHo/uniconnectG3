import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyJwtCookie = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies?.uniconnect_token;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado', code: 'NO_TOKEN' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', code: 'INVALID_TOKEN' });
  }
};
