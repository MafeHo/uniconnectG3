import { Request, Response, NextFunction } from 'express';
import logger from '../../../config/logger';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalErrorHandler = (
  err: Error & { errors?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err.name === 'ZodError') {
    logger.warning(`Validation error: ${JSON.stringify(err.errors)}`);
    return res.status(400).json({
      error: true,
      message: "Validation Error",
      details: err.errors
    });
  }

  const errorMap: Record<string, number> = {
    'GROUP_NAME_ALREADY_EXISTS': 400,
    'MISSING_FIELDS': 400,
    'NAME_TOO_SHORT': 400,
    'ALREADY_MEMBER': 400,
    'REQUEST_ALREADY_EXISTS': 400,
    'CANNOT_REMOVE_SELF': 400,
    'NEW_ADMIN_NOT_FOUND': 400,
    'NOT_AUTHORIZED': 403,
    'PROFILE_NOT_FOUND': 404,
    'GROUP_NOT_FOUND': 404,
    'MEMBER_NOT_FOUND': 404,
    'NOT_A_MEMBER': 404,
    'STRUCTURE_NOT_FOUND': 404,
  };

  const status = errorMap[err.message] || 500;
  
  if (status === 500) {
    logger.critical(err.message || 'Error Interno del Servidor', err);
  } else {
    logger.warning(`Error esperado manejado: ${err.message}`);
  }

  res.status(status).json({
    error: true,
    message: err.message || "Internal Server Error"
  });
};
