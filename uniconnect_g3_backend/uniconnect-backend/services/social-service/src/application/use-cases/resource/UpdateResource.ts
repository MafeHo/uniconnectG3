import {
  IResourceRepository,
  IGroupMemberRepository,
} from '../../../domain/repositories';
import { OpenGraphService } from '../../services/OpenGraphService';

export interface UpdateResourceData {
  title?: string;
  description?: string;
  url?: string;
  type?: 'link' | 'file' | 'note';
  tags?: string[];
}

export class UpdateResource {
  private resourceRepo: IResourceRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private openGraphService: OpenGraphService;

  constructor(
    resourceRepo: IResourceRepository,
    groupMemberRepo: IGroupMemberRepository,
    openGraphService: OpenGraphService
  ) {
    this.resourceRepo = resourceRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.openGraphService = openGraphService;
  }

  async execute(
    groupId: string,
    resourceId: string,
    userId: string,
    updateData: UpdateResourceData
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

    const cleanUpdateData: Record<string, any> = { ...updateData };

    // 4. Re-extraer Open Graph si la URL cambia
    const type = updateData.type || existing.type;
    if (updateData.url && updateData.url !== existing.url && type === 'link') {
      const ogData = await this.openGraphService.extractMetadata(updateData.url);
      cleanUpdateData.openGraph = ogData;

      // Si no hay un título provisto explícitamente en el update y obtuvimos uno de OG
      if (ogData.title && (!updateData.title || updateData.title.trim() === '')) {
        cleanUpdateData.title = ogData.title;
      }
    }

    // 5. Persistir cambios
    await this.resourceRepo.update(groupId, resourceId, cleanUpdateData);

    return {
      success: true,
      message: 'Recurso actualizado correctamente.',
    };
  }
}
export default UpdateResource;
