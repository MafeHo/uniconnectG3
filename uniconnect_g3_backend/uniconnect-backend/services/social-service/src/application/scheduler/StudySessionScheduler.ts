import axios from 'axios';
import { StudySession } from '../../domain/StudySession';
import {
  IStudySessionRepository,
  IGroupMemberRepository,
  IGroupRepository,
} from '../../domain/repositories';

export class StudySessionScheduler {
  private static instance: StudySessionScheduler | null = null;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  private sessionRepo!: IStudySessionRepository;
  private groupMemberRepo!: IGroupMemberRepository;
  private groupRepo!: IGroupRepository;
  private notificationServiceUrl!: string;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): StudySessionScheduler {
    if (!StudySessionScheduler.instance) {
      StudySessionScheduler.instance = new StudySessionScheduler();
    }
    return StudySessionScheduler.instance;
  }

  public init(
    sessionRepo: IStudySessionRepository,
    groupMemberRepo: IGroupMemberRepository,
    groupRepo: IGroupRepository,
    notificationServiceUrl: string
  ): void {
    this.sessionRepo = sessionRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
    this.notificationServiceUrl = notificationServiceUrl;
    this.isInitialized = true;
    console.log('[StudySessionScheduler] Initialized with notification service url:', notificationServiceUrl);
  }

  public schedule(session: StudySession): void {
    if (!this.isInitialized) {
      console.warn('[StudySessionScheduler] Cannot schedule: Scheduler is not initialized.');
      return;
    }

    if (!session.id) {
      console.warn('[StudySessionScheduler] Cannot schedule: Session has no id.');
      return;
    }

    if (session.status === 'cancelled') {
      return; // No programar si ya está cancelada
    }

    // 1. Calcular reminderDate = session.date + session.time - session.reminderMinutesBefore
    const [year, month, day] = session.date.split('-').map(Number);
    const [hour, minute] = session.time.split(':').map(Number);
    const sessionDateObj = new Date(year, month - 1, day, hour, minute, 0, 0);

    const reminderMinutes = session.reminderMinutesBefore ?? 30;
    const reminderTimeMs = sessionDateObj.getTime() - reminderMinutes * 60 * 1000;
    const delay = reminderTimeMs - Date.now();

    // 2. Si el delay ya expiró, no hacer nada
    if (delay <= 0) {
      console.log(`[StudySessionScheduler] Reminder delay <= 0 for session ${session.id}. Skipping scheduler.`);
      return;
    }

    // 3. Cancelar timer existente para esta sesión si lo hay (para re-programaciones)
    this.cancel(session.id);

    // 4. Programar setTimeout
    const timer = setTimeout(() => {
      this.sendReminder(session).catch((err) => {
        console.error('[StudySessionScheduler] Error in sendReminder callback:', err);
      });
    }, delay);

    this.timers.set(session.id, timer);
    console.log(
      `[StudySessionScheduler] Scheduled reminder for session ${session.id} ("${session.title}") in ${Math.round(
        delay / 1000 / 60
      )} minutes.`
    );
  }

  public cancel(sessionId: string): void {
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(sessionId);
      console.log(`[StudySessionScheduler] Cancelled active timer for session ${sessionId}.`);
    }
  }

  private async sendReminder(session: StudySession): Promise<void> {
    console.log(`[StudySessionScheduler] Triggering reminder for session ${session.id}...`);

    // 1. Obtener miembros del grupo
    const members = await this.groupMemberRepo.findByGroupId(session.groupId);
    if (members.length === 0) {
      console.log(`[StudySessionScheduler] No members to notify in group ${session.groupId}.`);
      this.timers.delete(session.id!);
      return;
    }

    // 2. Obtener nombre del grupo
    const group = await this.groupRepo.findById(session.groupId);
    const groupName = group ? group.name : 'tu grupo';

    // 3. Despachar a cada miembro vía endpoint del NotificationService
    for (const member of members) {
      try {
        await axios.post(`${this.notificationServiceUrl}/notify`, {
          event: 'RECORDATORIO_SESION',
          payload: {
            userId: member.userId,
            sessionId: session.id,
            sessionTitle: session.title,
            sessionDate: session.date,
            sessionTime: session.time,
            groupId: session.groupId,
            groupName: groupName,
          },
        });
      } catch (error: any) {
        console.error(
          `[StudySessionScheduler] Failed to dispatch HTTP notification to user ${member.userId}:`,
          error.message
        );
      }
    }

    // 4. Limpiar timer del mapa
    this.timers.delete(session.id!);
    console.log(`[StudySessionScheduler] Reminder dispatched and timer cleared for session ${session.id}.`);
  }

  public async restoreActiveTimers(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[StudySessionScheduler] Cannot restore: Scheduler not initialized.');
      return;
    }

    try {
      // Obtener próximas sesiones que ocurran en las próximas 24 horas (u 60 minutos como dice el plan,
      // usaremos el findUpcoming de FirestoreStudySessionRepository que busca próximas sesiones futuras)
      const upcomingSessions = await this.sessionRepo.findUpcoming(1440); // 24 horas para ser más robustos en restauración
      let count = 0;
      for (const session of upcomingSessions) {
        this.schedule(session);
        count++;
      }
      console.log(`[StudySessionScheduler] Successfully restored ${count} active study session timers.`);
    } catch (err: any) {
      console.error('[StudySessionScheduler] Error restoring active timers from database:', err.message);
    }
  }
}

export default StudySessionScheduler;
