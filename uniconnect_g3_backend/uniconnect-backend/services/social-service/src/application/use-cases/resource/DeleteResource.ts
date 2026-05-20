import {
  IResourceRepository,
  IGroupMemberRepository,
} from '../../../domain/repositories';

export class DeleteResource {
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
    resourceId: string,
    userId: string
  ): Promise<Record<string, unknown>> {
    // 1. Validar membresía del solicitante
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    // 2. Obtener recurso existente
    const existing = await this.resourceRepo.findById(groupId, resourceId);
    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // 3. Verificar permisos diferenciados: solo propietario o administrador (Criterio 3)
    const isOwner = existing.uploaderId === userId;
    const isAdmin = member.isAdmin ? member.isAdmin() : member.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new Error('NOT_RESOURCE_OWNER');
    }

    // 4. Eliminar
    await this.resourceRepo.delete(groupId, resourceId);

    return {
      success: true,
      message: 'Recurso eliminado correctamente.',
    };
  }
}
export default DeleteResource;
