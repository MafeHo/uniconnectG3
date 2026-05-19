import { IGroupMemberRepository, IGroupRepository, IAcademicCatalogRepository, IUserRepository } from '../../../domain/repositories';

export class GetUserGroups {
  private groupMemberRepo: IGroupMemberRepository;
  private groupRepo: IGroupRepository;
  private catalogRepo: IAcademicCatalogRepository;
  private userRepo: IUserRepository;

  constructor(
    groupMemberRepo: IGroupMemberRepository,
    groupRepo: IGroupRepository,
    catalogRepo: IAcademicCatalogRepository,
    userRepo: IUserRepository
  ) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute(userId: string, role?: string): Promise<Record<string, unknown>[]> {
    const memberships = await this.groupMemberRepo.findByUserId(userId, role);
    const groupIds = memberships.map(m => m.groupId).filter((id): id is string => Boolean(id));
    if (groupIds.length === 0) return [];

    const groups: Record<string, unknown>[] = [];
    for (const groupId of groupIds) {
      const group = await this.groupRepo.findById(groupId);
      if (!group) continue;

      const subject = await this.catalogRepo.findSubjectById(group.subjectId);
      const subjectName = subject ? subject.name : 'Materia desconocida';

      let adminName = 'Desconocido';
      if (group.creatorId) {
        const creator = await this.userRepo.findById(group.creatorId);
        if (creator) adminName = creator.name || 'Desconocido';
      }

      const members = await this.groupMemberRepo.findByGroupId(groupId);
      const memberIds = members.map(m => m.userId).filter((id): id is string => Boolean(id));
      const memberUsers = await this.userRepo.findByIds(memberIds);
      const memberNames = memberUsers.map(u => u.exists !== false ? u.name : 'Usuario desconocido');

      groups.push({
        ...group,
        subjectName,
        adminName,
        members: memberNames
      });
    }

    return groups;
  }
}
export default GetUserGroups;
