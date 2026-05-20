import { IStudySessionRepository, IGroupMemberRepository } from '../../../domain/repositories';

export class UpdateAttendance {
  private sessionRepo: IStudySessionRepository;
  private groupMemberRepo: IGroupMemberRepository;

  constructor(sessionRepo: IStudySessionRepository, groupMemberRepo: IGroupMemberRepository) {
    this.sessionRepo = sessionRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(
    groupId: string,
    sessionId: string,
    userId: string,
    status: 'confirmed' | 'declined'
  ): Promise<{ success: boolean; attendees: Record<string, string> }> {
    // 1. Validar que el usuario sea miembro del grupo
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('Solo los miembros del grupo pueden confirmar o declinar asistencia.');
    }

    // 2. Obtener sesión de estudio
    const session = await this.sessionRepo.findById(groupId, sessionId);
    if (!session) {
      throw new Error('La sesión de estudio especificada no existe.');
    }

    if (session.status === 'cancelled') {
      throw new Error('No se puede cambiar la asistencia de una sesión cancelada.');
    }

    // 3. Actualizar asistencia
    const updatedAttendees = {
      ...session.attendees,
      [userId]: status,
    };

    await this.sessionRepo.update(groupId, sessionId, { attendees: updatedAttendees });

    return {
      success: true,
      attendees: updatedAttendees,
    };
  }
}
export default UpdateAttendance;
