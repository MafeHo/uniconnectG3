import {
  IStudySessionRepository,
  IGroupMemberRepository,
  IGroupRepository,
} from '../../../domain/repositories';
import { StudySession } from '../../../domain/StudySession';
import { ISubject, GroupEvents } from '../../../domain/observer/ISubject';
import { StudySessionScheduler } from '../../scheduler/StudySessionScheduler';

export class CreateStudySession {
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

  async execute(
    groupId: string,
    creatorId: string,
    sessionData: {
      title: string;
      description?: string;
      date: string;
      time: string;
      duration: number;
      location: string;
      recurrenceRule?: { frequency: 'weekly'; endDate: string };
      reminderMinutesBefore?: number;
    }
  ): Promise<StudySession[]> {
    // 1. Validar membresía del creador
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, creatorId);
    if (!member) {
      throw new Error('Solo los miembros activos del grupo pueden crear sesiones.');
    }

    // 2. Obtener nombre del grupo y validar estado del grupo
    let groupName = 'el grupo';
    if (this.groupRepo) {
      const group = await this.groupRepo.findById(groupId);
      if (!group) {
        throw new Error('El grupo especificado no existe.');
      }
      if (group.state === 'bloqueado' || group.state === 'disuelto') {
        throw new Error('No se pueden programar sesiones en un grupo bloqueado o disuelto.');
      }
      groupName = group.name;
    }

    // 3. Crear sesión base y validar
    const baseSession = new StudySession({
      groupId,
      title: sessionData.title,
      description: sessionData.description,
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration,
      location: sessionData.location,
      creatorId,
      recurrenceRule: sessionData.recurrenceRule,
      reminderMinutesBefore: sessionData.reminderMinutesBefore,
      status: 'scheduled',
      attendees: { [creatorId]: 'confirmed' }, // Creador asiste por defecto
    });

    baseSession.validate();

    let createdSessions: StudySession[] = [];

    // 4. Lógica de recurrencia
    if (sessionData.recurrenceRule) {
      const recurringSessions = StudySession.generateRecurringSeries(
        baseSession,
        sessionData.recurrenceRule.endDate
      );

      const ids = await this.sessionRepo.createBatch(recurringSessions);
      for (let i = 0; i < recurringSessions.length; i++) {
        recurringSessions[i].id = ids[i];
        this.sessionScheduler.schedule(recurringSessions[i]);
      }
      createdSessions = recurringSessions;
    } else {
      const id = await this.sessionRepo.create(baseSession);
      baseSession.id = id;
      this.sessionScheduler.schedule(baseSession);
      createdSessions = [baseSession];
    }

    // 5. Notificar a los observadores sobre la nueva sesión creada
    const allMembers = await this.groupMemberRepo.findByGroupId(groupId);
    for (const m of allMembers) {
      if (m.userId !== creatorId) {
        this.studyGroupSubject.notify(GroupEvents.SESION_CREADA, {
          groupId,
          groupName,
          targetUserId: m.userId,
          sessionTitle: baseSession.title,
          sessionId: baseSession.id,
          userName: m.userName || 'Un compañero',
        });
      }
    }

    return createdSessions;
  }
}
export default CreateStudySession;
