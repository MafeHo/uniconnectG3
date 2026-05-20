import {
  IResourceRepository,
  IGroupMemberRepository,
} from '../../../domain/repositories';

export class GetGroupResources {
  private resourceRepo: IResourceRepository;
  private groupMemberRepo: IGroupMemberRepository;

  constructor(
    resourceRepo: IResourceRepository,
    groupMemberRepo: IGroupMemberRepository
  ) {
    this.resourceRepo = resourceRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(
    groupId: string,
    userId: string,
    filters?: { type?: 'link' | 'file' | 'note' }
  ): Promise<Record<string, unknown>[]> {
    // 1. Validar membresía del solicitante
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    // 2. Obtener recursos filtrados
    return this.resourceRepo.findByGroupId(groupId, filters);
  }
}
export default GetGroupResources;
