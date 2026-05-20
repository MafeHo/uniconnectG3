import { IGroupRepository, IGroupMemberRepository, IGroupRequestRepository } from '../../../domain/repositories';
import { ISubject } from '../../../domain/observer/ISubject';

export class HandleRequestAction {
  private groupMemberRepo: IGroupMemberRepository;
  private groupRequestRepo: IGroupRequestRepository;
  private groupRepo: IGroupRepository;
  private subject: ISubject;

  constructor(
    groupMemberRepo: IGroupMemberRepository,
    groupRequestRepo: IGroupRequestRepository,
    groupRepo: IGroupRepository,
    subject: ISubject
  ) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.groupRepo = groupRepo;
    this.subject = subject;
  }

  async execute(groupId: string, requestId: string, status: string): Promise<any> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }
    
    // Si el grupo cargado tiene estado guardado y no es Activo, validamos
    if (group.state && group.state !== 'Activo' && (group.state as any).constructor?.name !== 'Activo') {
      throw new Error(`No se pueden procesar solicitudes. El grupo está en estado: ${group.state}`);
    }

    if (status === 'accepted') {
      await this.groupMemberRepo.add({
        groupId,
        userId: requestId,
        role: 'student',
        joinedAt: new Date()
      });

      await this.groupRequestRepo.updateStatus(groupId, requestId, 'accepted');

      this.subject.notify('NOTIFICACION_SISTEMA', {
        targetUserId: requestId,
        userId: requestId,
        type: 'group_request_accepted',
        groupId,
        groupName: group.name
      });

    } else {
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'rejected');
    }

    return { message: `Solicitud ${status} correctamente para el grupo ${group.name}` };
  }
}
export default HandleRequestAction;
