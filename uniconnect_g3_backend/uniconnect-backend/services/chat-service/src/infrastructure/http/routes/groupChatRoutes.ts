import express, { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { GroupChatController } from '../controllers/groupChatController';

export function createGroupChatRoutes(controller: GroupChatController): Router {
  const router = express.Router();

  router.post('/:groupId/messages', controller.sendMessage);
  router.post('/:groupId/files', upload.single('file'), controller.sendFileMessage);
  router.post('/:groupId/messages/:messageId/reactions', controller.addGroupReaction);
  
  // US-V04: Poll routes
  router.post('/:groupId/polls', controller.createPoll);
  router.post('/:groupId/polls/:messageId/vote', controller.votePoll);
  router.get('/:groupId/polls/:messageId/results', controller.getPollResults);

  return router;
}

export default createGroupChatRoutes;
