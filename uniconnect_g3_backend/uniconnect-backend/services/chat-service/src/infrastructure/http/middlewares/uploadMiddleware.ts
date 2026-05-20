import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const handleUploadError = (err: Error | unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (err && typeof err === 'object' && 'code' in err) {
    const error = err as { code: string };
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB."
      });
      return;
    }
  }
  next(err);
};
