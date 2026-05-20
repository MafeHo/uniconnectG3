import { IGroupRepository, IGroupMemberRepository, IGroupRequestRepository } from '../../../domain/repositories';
import { ISubject, GroupEvents } from '../../../domain/observer/ISubject';

export class SendJoinRequest {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private groupRequestRepo: IGroupRequestRepository;
  private subject: ISubject;

  constructor(
    groupRepo: IGroupRepository,
    groupMemberRepo: IGroupMemberRepository,
    groupRequestRepo: IGroupRequestRepository,
    subject: ISubject
  ) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.subject = subject;
  }

  async execute(groupId: string, { userId, userName }: { userId: string; userName: string }): Promise<any> {
    if (!userId || !userName) {
      throw new Error('MISSING_FIELDS');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (member) {
      throw new Error('ALREADY_MEMBER');
    }

    const existingRequest = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new Error('REQUEST_ALREADY_EXISTS');
      }
      await this.groupRequestRepo.deleteByUserAndGroup(groupId, userId);
    }

    const newRequest = { groupId, userId, userName };
    const result = await this.groupRequestRepo.create(newRequest);

    if (this.subject && group.creatorId) {
      this.subject.notify(GroupEvents.SOLICITUD_INGRESO, {
        targetUserId: group.creatorId,
        groupId: group.id,
        groupName: group.name,
        userName: userName,
        applicantId: userId,
        requestId: (result && result.id) ? result.id : userId
      });
    }

    return result;
  }
}
export default SendJoinRequest;
