import { IGroupMemberRepository } from '../../../domain/repositories';

export class AddMember {
  private groupMemberRepo: IGroupMemberRepository;

  constructor(groupMemberRepo: IGroupMemberRepository) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId: string, { userId, role }: { userId: string; role?: string }): Promise<any> {
    const existing = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (existing) {
      throw new Error('ALREADY_MEMBER');
    }

    await this.groupMemberRepo.add({
      groupId,
      userId,
      role: role || 'student',
      joinedAt: new Date()
    });

    return { message: 'Miembro añadido correctamente' };
  }
}
export default AddMember;
