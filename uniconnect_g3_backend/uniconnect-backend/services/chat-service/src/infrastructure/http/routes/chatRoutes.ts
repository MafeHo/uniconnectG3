import express, { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { ChatController } from '../controllers/chatController';

export function createChatRoutes(controller: ChatController): Router {
  const router = express.Router();

  router.post('/', controller.createChat);
  router.post('/:chatId/messages', controller.sendMessage);
  router.get('/:chatId/messages', controller.getMessage);
  router.post('/:chatId/files', upload.single('file'), controller.sendFileMessage);
  router.post('/:chatId/messages/:messageId/reactions', controller.addReaction);

  return router;
}

export default createChatRoutes;
