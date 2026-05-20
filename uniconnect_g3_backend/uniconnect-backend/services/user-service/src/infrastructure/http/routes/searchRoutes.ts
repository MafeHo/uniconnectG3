import { Router } from 'express';
import SearchController from '../controllers/searchController';

export default function createSearchRoutes(controller: SearchController): Router {
  const router = Router();

  router.get('/', controller.searchStudents);

  return router;
}
