import { IGroupRepository, IGroupMemberRepository } from '../../../domain/repositories';

export class CreateGroup {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;

  constructor(groupRepo: IGroupRepository, groupMemberRepo: IGroupMemberRepository) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute({ name, subjectId, description, creatorId }: {
    name: string;
    subjectId: string;
    description?: string;
    creatorId: string;
  }): Promise<any> {
    if (!name || !subjectId || !creatorId) {
      throw new Error('MISSING_FIELDS');
    }
    if (name.length < 3) {
      throw new Error('NAME_TOO_SHORT');
    }

    const existing = await this.groupRepo.findByName(name);
    if (existing) {
      throw new Error('GROUP_NAME_ALREADY_EXISTS');
    }

    const existingCount = await this.groupRepo.countBySubjectId(subjectId);
    if (existingCount >= 3) {
      throw new Error('SUBJECT_GROUP_LIMIT_REACHED');
    }

    const newGroup = await this.groupRepo.create({ name, subjectId, description, creatorId });

    await this.groupMemberRepo.add({
      groupId: newGroup.id,
      userId: creatorId,
      role: 'admin',
      joinedAt: new Date()
    });

    return newGroup;
  }
}
export default CreateGroup;
