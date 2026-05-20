import {
  IResourceRepository,
  IGroupMemberRepository,
  IGroupRepository,
} from '../../../domain/repositories';
import { IRecurso } from '../../../domain/IRecurso';
import { RecursoBase } from '../../../domain/RecursoBase';
import { RecursoConEtiquetas } from '../../../domain/decorators/RecursoConEtiquetas';
import { OpenGraphService } from '../../services/OpenGraphService';
import { ISubject } from '../../../domain/observer/ISubject';

export interface CreateResourceData {
  title: string;
  description?: string;
  url: string;
  type: 'link' | 'file' | 'note';
  uploaderName: string;
  tags?: string[];
}

export class CreateResource {
  private resourceRepo: IResourceRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private openGraphService: OpenGraphService;
  private studyGroupSubject: ISubject;
  private groupRepo: IGroupRepository;

  constructor(
    resourceRepo: IResourceRepository,
    groupMemberRepo: IGroupMemberRepository,
    openGraphService: OpenGraphService,
    studyGroupSubject: ISubject,
    groupRepo: IGroupRepository
  ) {
    this.resourceRepo = resourceRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.openGraphService = openGraphService;
    this.studyGroupSubject = studyGroupSubject;
    this.groupRepo = groupRepo;
  }

  async execute(groupId: string, uploaderId: string, data: CreateResourceData): Promise<Record<string, unknown>> {
    // 1. Validar membresía del uploader
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, uploaderId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    // 2. Crear recurso base y validar
    const baseRecurso = new RecursoBase({
      groupId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type,
      uploaderId,
      uploaderName: data.uploaderName,
    });

    baseRecurso.validate();

    let recurso: IRecurso = baseRecurso;

    // 3. Extraer Open Graph si es un enlace
    if (data.type === 'link' && data.url) {
      const ogData = await this.openGraphService.extractMetadata(data.url);
      baseRecurso.openGraph = ogData;
      
      // Si se extrajo título de Open Graph y el título proveído es la url o está vacío
      if (ogData.title && (!data.title || data.title.trim() === '' || data.title === data.url)) {
        baseRecurso.title = ogData.title;
      }
    }

    // 4. Aplicar decorador de etiquetas iniciales si existen
    if (data.tags && data.tags.length > 0) {
      recurso = new RecursoConEtiquetas(recurso, data.tags);
    }

    // 5. Persistir en base de datos
    const metadata = recurso.getMetadata();
    const id = await this.resourceRepo.create(groupId, metadata);
    metadata.id = id;

    // 6. Notificar a los miembros del grupo
    let groupName = 'el grupo';
    try {
      const group = await this.groupRepo.findById(groupId);
      if (group) {
        groupName = group.name;
      }
    } catch (err) {
      console.warn('[CreateResource] No se pudo obtener el nombre del grupo:', err);
    }

    try {
      const allMembers = await this.groupMemberRepo.findByGroupId(groupId);
      for (const m of allMembers) {
        if (m.userId !== uploaderId) {
          this.studyGroupSubject.notify('RECURSO_NUEVO', {
            groupId,
            groupName,
            targetUserId: m.userId,
            resourceTitle: baseRecurso.title,
            uploaderName: data.uploaderName,
            resourceId: id,
          });
        }
      }
    } catch (err) {
      console.warn('[CreateResource] Error al enviar notificaciones de nuevo recurso:', err);
    }

    return metadata;
  }
}
export default CreateResource;
