import { Router } from 'express';
import ProfileController from '../controllers/profileController';

export default function createProfileRoutes(controller: ProfileController): Router {
  const router = Router();

  // Es importante poner las rutas específicas antes de las paramétricas
  router.get('/estadisticas/:studentId', controller.getDecoratedProfile);
  router.get('/:studentId', controller.getProfile);
  router.post('/', controller.upsertProfile);

  return router;
}
