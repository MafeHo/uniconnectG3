import { IGroupRepository, IGroupMemberRepository, IGroupRequestRepository, IAcademicCatalogRepository, IUserRepository } from '../../../domain/repositories';

export class SearchGroups {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private groupRequestRepo: IGroupRequestRepository;
  private catalogRepo: IAcademicCatalogRepository;
  private userRepo: IUserRepository;

  constructor(
    groupRepo: IGroupRepository,
    groupMemberRepo: IGroupMemberRepository,
    groupRequestRepo: IGroupRequestRepository,
    catalogRepo: IAcademicCatalogRepository,
    userRepo: IUserRepository
  ) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute({ subjectId, search, userSubjectIds, userId }: {
    subjectId?: string;
    search?: string;
    userSubjectIds?: string;
    userId?: string;
  }): Promise<Record<string, unknown>[]> {
    let groups = await this.groupRepo.findAll();

    if (subjectId) {
      groups = groups.filter(g => g.subjectId === subjectId);
    }

    if (userSubjectIds) {
      const allowedIds = userSubjectIds.split(',');
      groups = groups.filter(group => allowedIds.includes(group.subjectId));
    }

    if (userId) {
      groups = groups.filter(group => group.creatorId !== userId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const allSubjects = await this.catalogRepo.getAllSubjects();
      const subjectsMap: Record<string, string> = {};
      allSubjects.forEach((sub) => {
        if (sub.id && sub.name) subjectsMap[sub.id] = sub.name;
      });

      groups = groups.filter(group => {
        const searchTerms = searchLower.split(' ').filter(t => t.length > 0);
        const checkMatch = (text: string) => {
          if (!text) return false;
          const words = text.toLowerCase().split(' ');
          return searchTerms.every(term =>
            words.some(word => word.startsWith(term))
          );
        };
        const groupNameMatches = checkMatch(group.name);
        const subjectName = subjectsMap[group.subjectId] || '';
        const subjectMatches = checkMatch(subjectName);
        return groupNameMatches || subjectMatches;
      });

      groups = groups.map(group => ({
        ...group,
        subjectName: subjectsMap[group.subjectId] || 'Materia desconocida'
      })) as typeof groups;
    } else {
      for (const group of groups) {
        const subject = await this.catalogRepo.findSubjectById(group.subjectId);
        group.subjectName = subject ? subject.name : 'Materia desconocida';
      }
    }

    const enrichedGroups = await Promise.all(groups.map(async (group) => {
      let adminName = 'Desconocido';
      if (group.creatorId) {
        const creator = await this.userRepo.findById(group.creatorId);
        if (creator) adminName = creator.name || 'Desconocido';
      }

      const members = await this.groupMemberRepo.findByGroupId(group.id!);
      const memberIds = members.map(m => m.userId).filter((id): id is string => Boolean(id));
      const memberUsers = await this.userRepo.findByIds(memberIds);
      const memberNames = memberUsers.map(u => u.exists !== false ? u.name || 'Usuario desconocido' : 'Usuario desconocido');

      let userStatus = 'none';
      if (userId) {
        if (group.creatorId === userId) {
          userStatus = 'admin';
        } else if (memberIds.includes(userId)) {
          userStatus = 'member';
        } else {
          const request = await this.groupRequestRepo.findByGroupAndUser(group.id!, userId);
          if (request) {
            userStatus = request.status || 'pending';
          }
        }
      }

      return {
        ...group,
        adminName,
        members: memberNames,
        userStatus
      };
    }));

    return enrichedGroups;
  }
}
export default SearchGroups;
