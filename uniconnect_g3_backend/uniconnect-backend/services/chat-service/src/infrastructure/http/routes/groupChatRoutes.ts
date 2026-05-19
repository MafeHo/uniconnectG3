import express, { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { GroupChatController } from '../controllers/groupChatController';

export function createGroupChatRoutes(controller: GroupChatController): Router {
  const router = express.Router();

  router.post('/:groupId/messages', controller.sendMessage);
  router.post('/:groupId/files', upload.single('file'), controller.sendFileMessage);
  router.post('/:groupId/messages/:messageId/reactions', controller.addGroupReaction);

  return router;
}

export default createGroupChatRoutes;
