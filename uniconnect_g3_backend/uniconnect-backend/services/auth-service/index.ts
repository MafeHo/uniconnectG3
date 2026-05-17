import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { DatabaseFactory } from './src/config/databaseFactory';
import { FirestoreUserRepository } from './src/infrastructure/database/FirestoreUserRepository';
import configurePassport from './src/config/passport';
import { createAuthRoutes } from './src/infrastructure/http/routes/authRoutes';
import { AuthController } from './src/infrastructure/http/controllers/authController';
import { globalErrorHandler } from './src/infrastructure/http/middlewares/errorMiddleware';

const db = DatabaseFactory.getDatabase();
const userRepo = new FirestoreUserRepository(db);

configurePassport(userRepo);

const authController = new AuthController(userRepo);

const app: Express = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.DASHBOARD_URL,
  process.env.BASE_URL,
].filter((origin): origin is string => !!origin);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createAuthRoutes(authController));

// Registramos el manejador global de errores para Zod / Express
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🔐 Auth Service listo en puerto ${PORT}`));
}

export default app;
