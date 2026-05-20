import { GroupMember } from '../../../domain/GroupMember';
import { IGroupRepository, IGroupMemberRepository } from '../../../domain/repositories';
import { ISubject } from '../../../domain/observer/ISubject';
import * as admin from 'firebase-admin';

export class HandleAdminTransferResponse {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private db: admin.firestore.Firestore;
  private subject: ISubject;

  constructor(
    groupRepo: IGroupRepository,
    groupMemberRepo: IGroupMemberRepository,
    db: admin.firestore.Firestore,
    subject: ISubject
  ) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId: string, candidateId: string, action: string): Promise<any> {
    const group = await this.groupRepo.findById(groupId);
    const transfer = group ? group.pendingAdminTransfer : null;
    const requesterId = transfer ? transfer.requesterId : null;

    const member = new GroupMember({
      groupId,
      userId: candidateId
    });

    member.state = { subject: this.subject } as any; 
    member.transitionTo('PendienteTransferencia');

    if (action === 'accept') {
      await member.aceptar();

      if (member.state && member.state.constructor.name === 'TransferenciaAceptada') {
        try {
          await this.db.runTransaction(async (transaction) => {
            const groupRef = this.db.collection('groups').doc(groupId);
            transaction.update(groupRef, { creatorId: candidateId, pendingAdminTransfer: null });

            const candidateMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, candidateId);
            if (candidateMember) transaction.update(candidateMember.ref, { role: 'admin' });

            if (requesterId) {
              const oldAdminMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, requesterId);
              if (oldAdminMember) transaction.delete(oldAdminMember.ref);
            }
          });

          return { success: true, message: 'Transferencia completada. Estado: TransferenciaAceptada' };
        } catch (error: unknown) {
          member.transitionTo('PendienteTransferencia');
          const errMsg = error instanceof Error ? error.message : String(error);
          throw new Error('Fallo en la persistencia, el estado se ha revertido: ' + errMsg);
        }
      }
    } else if (action === 'reject') {
      await member.rechazar();

      if (member.state && member.state.constructor.name === 'Activo') {
        try {
          await this.groupRepo.update(groupId, { pendingAdminTransfer: null });
          return { success: true, message: 'Solicitud de transferencia rechazada. Estado regresó a Activo.' };
        } catch (error: unknown) {
          member.transitionTo('PendienteTransferencia');
          const errMsg = error instanceof Error ? error.message : String(error);
          throw new Error('Fallo en la persistencia del rechazo, estado revertido: ' + errMsg);
        }
      }
    }
  }
}
export default HandleAdminTransferResponse;
