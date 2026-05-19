import { IGroupMemberRepository } from '../../../domain/repositories';
import { ISubject, GroupEvents } from '../../../domain/observer/ISubject';
import * as admin from 'firebase-admin';

export class TransferAdmin {
  private groupMemberRepo: IGroupMemberRepository;
  private db: admin.firestore.Firestore;
  private subject: ISubject;

  constructor(
    groupMemberRepo: IGroupMemberRepository,
    db: admin.firestore.Firestore,
    subject: ISubject
  ) {
    this.groupMemberRepo = groupMemberRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId: string, adminId: string, newAdminId: string): Promise<any> {
    if (!adminId || !newAdminId) {
      throw new Error('MISSING_FIELDS');
    }

    const groupDataForNotify = await this.db.runTransaction(async (transaction) => {
      const groupRef = this.db.collection('groups').doc(groupId);
      const groupDoc = await transaction.get(groupRef);

      if (!groupDoc.exists) {
        throw new Error('GROUP_NOT_FOUND');
      }

      const currentAdminData = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, adminId);
      if (!currentAdminData || currentAdminData.data.role !== 'admin') {
        throw new Error('NOT_AUTHORIZED');
      }

      const newAdminData = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, newAdminId);
      if (!newAdminData) {
        throw new Error('NEW_ADMIN_NOT_FOUND');
      }

      transaction.update(groupRef, { creatorId: newAdminId });
      transaction.update(newAdminData.ref, { role: 'admin' });
      transaction.delete(currentAdminData.ref);

      return { id: groupDoc.id, ...groupDoc.data() } as { id: string; name?: string };
    });

    if (this.subject && groupDataForNotify) {
      this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN, {
        targetUserId: newAdminId,
        groupId: groupDataForNotify.id,
        groupName: groupDataForNotify.name
      });
    }

    return { success: true };
  }
}
export default TransferAdmin;
