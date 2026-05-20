import express, { Router } from 'express';
import { StudySessionController } from '../controllers/studySessionController';

export function createStudySessionRoutes(controller: StudySessionController): Router {
  const router = express.Router();

  router.post('/:groupId/sessions', controller.createSession);
  router.get('/:groupId/sessions', controller.getGroupSessions);
  router.patch('/:groupId/sessions/:sessionId', controller.cancelSession);
  router.post('/:groupId/sessions/:sessionId/attendance', controller.updateAttendance);
  router.put('/:groupId/availability', controller.updateAvailability);

  return router;
}

export default createStudySessionRoutes;
