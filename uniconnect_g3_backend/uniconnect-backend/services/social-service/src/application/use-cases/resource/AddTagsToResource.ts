import {
  IResourceRepository,
  IGroupMemberRepository,
} from '../../../domain/repositories';
import { RecursoBase } from '../../../domain/RecursoBase';
import { RecursoConEtiquetas } from '../../../domain/decorators/RecursoConEtiquetas';

export class AddTagsToResource {
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
    userId: string,
    newTags: string[]
  ): Promise<Record<string, unknown>> {
    // 1. Validar membresía
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    // 2. Obtener recurso existente
    const existing = await this.resourceRepo.findById(groupId, resourceId);
    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // 3. Reconstruir RecursoBase y aplicar decorador
    const baseRecurso = new RecursoBase({
      id: existing.id as string,
      groupId: existing.groupId as string,
      title: existing.title as string,
      description: existing.description as string,
      url: existing.url as string,
      type: existing.type as any,
      uploaderId: existing.uploaderId as string,
      uploaderName: existing.uploaderName as string,
      openGraph: existing.openGraph as any,
      tags: existing.tags as string[],
      ratings: existing.ratings as any,
      averageRating: existing.averageRating as number,
      comments: existing.comments as any,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });

    const recursoDecorado = new RecursoConEtiquetas(baseRecurso, newTags);
    const metadata = recursoDecorado.getMetadata();

    // 4. Guardar cambios en el campo tags
    await this.resourceRepo.update(groupId, resourceId, { tags: metadata.tags });

    return {
      success: true,
      tags: metadata.tags,
    };
  }
}
export default AddTagsToResource;
