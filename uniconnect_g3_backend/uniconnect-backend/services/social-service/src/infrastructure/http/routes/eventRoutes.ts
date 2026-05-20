import express, { Router } from 'express';
import { EventController } from '../controllers/eventController';

export function createEventRoutes(controller: EventController): Router {
  const router = express.Router();

  router.get('/', controller.getEvents);
  router.post('/', controller.createEvent);
  router.get('/categories', controller.getCategories);

  router.post('/suscribir', controller.subscribe);
  router.delete('/suscribir', controller.unsubscribe);
  router.get('/suscripciones/:userId', controller.getSubscribedCategories);

  return router;
}
export default createEventRoutes;
