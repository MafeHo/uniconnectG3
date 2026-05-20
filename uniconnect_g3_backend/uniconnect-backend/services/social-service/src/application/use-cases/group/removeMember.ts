import { IGroupMemberRepository } from '../../../domain/repositories';

export class RemoveMember {
  private groupMemberRepo: IGroupMemberRepository;

  constructor(groupMemberRepo: IGroupMemberRepository) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId: string, userId: string, adminId: string): Promise<any> {
    const adminMember = await this.groupMemberRepo.findByGroupAndUser(groupId, adminId);
    if (!adminMember || adminMember.role !== 'admin') {
      throw new Error('NOT_AUTHORIZED');
    }

    if (userId === adminId) {
      throw new Error('CANNOT_REMOVE_SELF');
    }

    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    await this.groupMemberRepo.remove(groupId, userId);
    return { message: 'Miembro eliminado con éxito del grupo' };
  }
}
export default RemoveMember;
