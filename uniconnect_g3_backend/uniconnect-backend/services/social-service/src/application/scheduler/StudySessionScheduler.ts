import { StudySession } from '../../domain/StudySession';

export class StudySessionScheduler {
  private static instance: StudySessionScheduler | null = null;

  private constructor() {}

  public static getInstance(): StudySessionScheduler {
    if (!StudySessionScheduler.instance) {
      StudySessionScheduler.instance = new StudySessionScheduler();
    }
    return StudySessionScheduler.instance;
  }

  public init(..._args: any[]): void {
    console.log('[StudySessionScheduler Stub] Initialized.');
  }

  public schedule(session: StudySession): void {
    console.log('[StudySessionScheduler Stub] Scheduled session:', session.id);
  }

  public cancel(sessionId: string): void {
    console.log('[StudySessionScheduler Stub] Cancelled session timer:', sessionId);
  }

  public async restoreActiveTimers(): Promise<void> {
    console.log('[StudySessionScheduler Stub] Restored active timers.');
  }
}
export default StudySessionScheduler;
