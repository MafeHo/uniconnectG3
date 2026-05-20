import {
  IGroupMemberRepository,
  IGroupRepository,
} from '../../../domain/repositories';
import { ISubject, GroupEvents } from '../../../domain/observer/ISubject';

export class UpdateAvailability {
  private groupMemberRepo: IGroupMemberRepository;
  private groupRepo: IGroupRepository;
  private studyGroupSubject: ISubject;

  constructor(
    groupMemberRepo: IGroupMemberRepository,
    groupRepo: IGroupRepository,
    studyGroupSubject: ISubject
  ) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
    this.studyGroupSubject = studyGroupSubject;
  }

  async execute(
    groupId: string,
    userId: string,
    availability: string[]
  ): Promise<{ success: boolean; availability: string[] }> {
    // 1. Obtener la referencia del miembro
    const memberRef = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, userId);
    if (!memberRef) {
      throw new Error('Solo los miembros del grupo pueden actualizar su disponibilidad.');
    }

    // 2. Actualizar la disponibilidad en el documento del miembro en Firestore
    await memberRef.ref.update({
      availability,
    });

    // 3. Obtener detalles del grupo y su creador (organizador)
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('El grupo especificado no existe.');
    }

    // 4. Notificar al organizador si es un miembro diferente
    if (group.creatorId && group.creatorId !== userId) {
      const userName = memberRef.data.userName || memberRef.data.displayName || 'Un compañero';
      this.studyGroupSubject.notify(GroupEvents.DISPONIBILIDAD_ACTUALIZADA, {
        groupId,
        groupName: group.name,
        targetUserId: group.creatorId, // El organizador recibe la notificación
        userName,
      });
    }

    return {
      success: true,
      availability,
    };
  }
}
export default UpdateAvailability;
