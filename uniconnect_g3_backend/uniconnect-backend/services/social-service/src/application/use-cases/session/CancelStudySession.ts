import {
  IStudySessionRepository,
  IGroupMemberRepository,
  IGroupRepository,
} from '../../../domain/repositories';
import { ISubject, GroupEvents } from '../../../domain/observer/ISubject';
import { StudySessionScheduler } from '../../scheduler/StudySessionScheduler';

export class CancelStudySession {
  private sessionRepo: IStudySessionRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private studyGroupSubject: ISubject;
  private sessionScheduler: StudySessionScheduler;
  private groupRepo?: IGroupRepository;

  constructor(
    sessionRepo: IStudySessionRepository,
    groupMemberRepo: IGroupMemberRepository,
    studyGroupSubject: ISubject,
    sessionScheduler: StudySessionScheduler,
    groupRepo?: IGroupRepository
  ) {
    this.sessionRepo = sessionRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.studyGroupSubject = studyGroupSubject;
    this.sessionScheduler = sessionScheduler;
    this.groupRepo = groupRepo;
  }

  async execute(groupId: string, sessionId: string, userId: string): Promise<{ success: boolean }> {
    // 1. Obtener la sesión
    const session = await this.sessionRepo.findById(groupId, sessionId);
    if (!session) {
      throw new Error('La sesión de estudio especificada no existe.');
    }

    if (session.status === 'cancelled') {
      throw new Error('La sesión ya se encuentra cancelada.');
    }

    // 2. Validar que el usuario que cancela es el creador o el administrador del grupo
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('Solo los miembros del grupo pueden cancelar sesiones.');
    }

    if (session.creatorId !== userId && member.role !== 'admin') {
      throw new Error('No tienes permisos para cancelar esta sesión de estudio.');
    }

    // 3. Cancelar en el repositorio (solo afecta a esta sesión específica, manteniendo la serie intacta)
    await this.sessionRepo.cancelById(groupId, sessionId);

    // 4. Cancelar el timer programado
    this.sessionScheduler.cancel(sessionId);

    // 5. Obtener nombre del grupo
    let groupName = 'el grupo';
    if (this.groupRepo) {
      const group = await this.groupRepo.findById(groupId);
      if (group) {
        groupName = group.name;
      }
    }

    // 6. Notificar a los observadores sobre la cancelación
    const allMembers = await this.groupMemberRepo.findByGroupId(groupId);
    for (const m of allMembers) {
      if (m.userId !== userId) {
        this.studyGroupSubject.notify(GroupEvents.SESION_CANCELADA, {
          groupId,
          groupName,
          targetUserId: m.userId,
          sessionTitle: session.title,
          sessionId: session.id,
          userName: m.userName || 'Un compañero',
        });
      }
    }

    return { success: true };
  }
}
export default CancelStudySession;
