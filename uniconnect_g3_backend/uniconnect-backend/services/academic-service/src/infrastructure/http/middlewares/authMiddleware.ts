import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export interface DecodedUser {
  uid: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token) as DecodedUser;
    (req as AuthenticatedRequest).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
