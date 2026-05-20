import { IStudySessionRepository, IGroupMemberRepository } from '../../../domain/repositories';
import { StudySession } from '../../../domain/StudySession';

export class GetGroupSessions {
  private sessionRepo: IStudySessionRepository;
  private groupMemberRepo: IGroupMemberRepository;

  constructor(sessionRepo: IStudySessionRepository, groupMemberRepo: IGroupMemberRepository) {
    this.sessionRepo = sessionRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId: string, userId: string): Promise<StudySession[]> {
    // 1. Validar que el usuario sea miembro del grupo
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('Solo los miembros del grupo pueden ver las sesiones.');
    }

    // 2. Obtener sesiones
    const sessions = await this.sessionRepo.findByGroupId(groupId);

    // 3. Enriquecer cada sesión con la asistencia del usuario
    for (const session of sessions) {
      if (session.attendees && session.attendees[userId]) {
        (session as any).userAttendance = session.attendees[userId];
      } else {
        (session as any).userAttendance = 'pending';
      }
      
      // Indicar si es recurrente de manera explícita para la UI
      (session as any).isRecurring = session.seriesId !== null;
    }

    return sessions;
  }
}
export default GetGroupSessions;
