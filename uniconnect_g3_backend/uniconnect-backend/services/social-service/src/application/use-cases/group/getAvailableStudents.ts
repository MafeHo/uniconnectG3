import { IGroupMemberRepository, IUserRepository } from '../../../domain/repositories';

export class GetAvailableStudents {
  private groupMemberRepo: IGroupMemberRepository;
  private userRepo: IUserRepository;

  constructor(groupMemberRepo: IGroupMemberRepository, userRepo: IUserRepository) {
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
  }

  async execute(groupId: string, subjectId: string, search: string = ''): Promise<Record<string, unknown>[]> {
    const currentMembers = await this.groupMemberRepo.findByGroupId(groupId);
    const excludedIds = currentMembers.map(m => m.userId).filter((id): id is string => Boolean(id));

    const allUsers = await this.userRepo.findAll();

    const students = allUsers.filter(user => {
      const enrolledSubjects = user.enrolledSubjects as string[] | undefined;
      const matchesSubject = Array.isArray(enrolledSubjects) && enrolledSubjects.includes(subjectId);
      const notInGroup = !excludedIds.includes(user.id as string);
      const nameStr = typeof user.name === 'string' ? user.name : '';
      const matchesName = nameStr.toLowerCase().includes(search.toLowerCase());
      return matchesSubject && notInGroup && matchesName;
    });

    return students;
  }
}
export default GetAvailableStudents;
