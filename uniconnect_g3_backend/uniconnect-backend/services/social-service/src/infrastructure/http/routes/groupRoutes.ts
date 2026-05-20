import express, { Router } from 'express';
import { GroupController } from '../controllers/groupController';

export function createGroupRoutes(controller: GroupController): Router {
  const router = express.Router();

  router.post('/', controller.createGroup);
  router.get('/check-name/:name', controller.checkGroupNameUnique);
  router.get('/user/:userId', controller.getUserGroups);
  router.get('/', controller.searchGroups);
  router.get('/:id', controller.getGroupById);

  router.post('/:id/requests', controller.sendJoinRequest);
  router.get('/:id/requests', controller.getGroupRequests);
  router.put('/:id/requests/:requestId', controller.handleRequestAction);
  router.delete('/:id/requests/:userId', controller.deleteUserRequests);

  router.post('/:id/members', controller.addMember);
  router.delete('/:id/members/:userId', controller.removeMember);
  router.delete('/:id/leave/:userId', controller.leaveGroup);

  router.put('/:id/transfer-admin', controller.transferAdmin);
  router.post('/:id/transfer-admin/request', controller.requestAdminTransfer);
  router.post('/:id/transfer-admin/response', controller.handleAdminTransferResponse);

  router.get('/:groupId/available-students', controller.getAvailableStudents);

  return router;
}
export default createGroupRoutes;
