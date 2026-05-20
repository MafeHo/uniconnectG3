import { GroupMember } from '../../../domain/GroupMember';
import { IGroupRepository, IGroupMemberRepository, IUserRepository } from '../../../domain/repositories';
import { ISubject } from '../../../domain/observer/ISubject';


export class RequestAdminTransfer {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private userRepo: IUserRepository;
  private subject: ISubject;

  constructor(
    groupRepo: IGroupRepository,
    groupMemberRepo: IGroupMemberRepository,
    userRepo: IUserRepository,
    subject: ISubject
  ) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
    this.subject = subject;
  }

  async execute(groupId: string, adminId: string, candidateId: string): Promise<any> {
    if (!adminId || !candidateId) {
      throw new Error('MISSING_FIELDS');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    if (group.creatorId !== adminId) {
      throw new Error('NOT_AUTHORIZED');
    }

    const candidateMember = await this.groupMemberRepo.findByGroupAndUser(groupId, candidateId);
    if (!candidateMember) {
      throw new Error('CANDIDATE_NOT_A_MEMBER');
    }

    const member = new GroupMember({
      groupId,
      userId: adminId
    });
    member.state = { subject: this.subject } as any;
    member.transitionTo('Activo');
    member.candidateId = candidateId;

    const requester = await this.userRepo.findById(adminId);
    member.userName = requester ? (requester.name || requester.displayName || 'Un administrador') : 'Un administrador';

    await member.transferir();

    if (member.state && member.state.constructor.name === 'PendienteTransferencia') {
      await this.groupRepo.update(groupId, {
        pendingAdminTransfer: {
          candidateId,
          requesterId: adminId,
          status: 'pending',
          requestedAt: new Date()
        }
      });
    }

    return { success: true, message: 'Solicitud de transferencia enviada. Estado: PendienteTransferencia' };
  }
}
export default RequestAdminTransfer;
