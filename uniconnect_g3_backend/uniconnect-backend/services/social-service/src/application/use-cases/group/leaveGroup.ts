import { IGroupMemberRepository, IGroupRepository } from '../../../domain/repositories';

export class LeaveGroup {
  private groupMemberRepo: IGroupMemberRepository;
  private groupRepo: IGroupRepository;

  constructor(groupMemberRepo: IGroupMemberRepository, groupRepo: IGroupRepository) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
  }

  async execute(groupId: string, userId: string): Promise<any> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    if (group.creatorId === userId) {
      throw new Error('ADMIN_CANNOT_LEAVE_WITHOUT_TRANSFER');
    }

    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    await this.groupMemberRepo.remove(groupId, userId);
    return { message: 'Has salido del grupo correctamente' };
  }
}
export default LeaveGroup;
