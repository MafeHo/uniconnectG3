import * as crypto from 'crypto';

export class StudySession {
  public id?: string;
  public groupId: string;
  public title: string;
  public description: string;
  public date: string; // ISO format: "YYYY-MM-DD"
  public time: string; // "HH:MM"
  public duration: number; // in minutes
  public location: string;
  public creatorId: string;
  public seriesId: string | null;
  public recurrenceRule: { frequency: 'weekly'; endDate: string } | null;
  public status: 'scheduled' | 'cancelled';
  public reminderMinutesBefore: number;
  public attendees: Record<string, 'confirmed' | 'declined' | 'pending'>;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor({
    id,
    groupId,
    title,
    description,
    date,
    time,
    duration,
    location,
    creatorId,
    seriesId,
    recurrenceRule,
    status,
    reminderMinutesBefore,
    attendees,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    groupId: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    duration: number;
    location: string;
    creatorId: string;
    seriesId?: string | null;
    recurrenceRule?: { frequency: 'weekly'; endDate: string } | null;
    status?: 'scheduled' | 'cancelled';
    reminderMinutesBefore?: number;
    attendees?: Record<string, 'confirmed' | 'declined' | 'pending'>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.groupId = groupId;
    this.title = title;
    this.description = description || '';
    this.date = date;
    this.time = time;
    this.duration = duration;
    this.location = location;
    this.creatorId = creatorId;
    this.seriesId = seriesId !== undefined ? seriesId : null;
    this.recurrenceRule = recurrenceRule !== undefined ? recurrenceRule : null;
    this.status = status || 'scheduled';
    this.reminderMinutesBefore = reminderMinutesBefore !== undefined ? reminderMinutesBefore : 30;
    this.attendees = attendees || {};
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public validate(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres.');
    }
    if (!this.groupId) {
      throw new Error('El ID de grupo es requerido.');
    }
    if (!this.creatorId) {
      throw new Error('El ID de creador es requerido.');
    }
    if (!this.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      throw new Error('La fecha debe estar en formato YYYY-MM-DD.');
    }
    if (!this.time || !/^\d{2}:\d{2}$/.test(this.time)) {
      throw new Error('La hora debe estar en formato HH:MM.');
    }
    if (this.duration < 15) {
      throw new Error('La duración de la sesión debe ser de al menos 15 minutos.');
    }
    if (this.recurrenceRule) {
      if (this.recurrenceRule.frequency !== 'weekly') {
        throw new Error('Solo se soporta recurrencia semanal ("weekly").');
      }
      if (!this.recurrenceRule.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(this.recurrenceRule.endDate)) {
        throw new Error('La fecha de fin de recurrencia debe estar en formato YYYY-MM-DD.');
      }
      if (this.recurrenceRule.endDate < this.date) {
        throw new Error('La fecha de fin de recurrencia debe ser igual o posterior a la fecha de inicio.');
      }
    }
  }

  public static generateRecurringSeries(baseSession: StudySession, endDate: string): StudySession[] {
    const seriesId = crypto.randomUUID();
    const sessions: StudySession[] = [];

    const parts = baseSession.date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const current = new Date(year, month, day);

    const endParts = endDate.split('-');
    const endYear = parseInt(endParts[0], 10);
    const endMonth = parseInt(endParts[1], 10) - 1;
    const endDay = parseInt(endParts[2], 10);
    const endLimit = new Date(endYear, endMonth, endDay);

    while (current <= endLimit) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const session = new StudySession({
        groupId: baseSession.groupId,
        title: baseSession.title,
        description: baseSession.description,
        date: dateStr,
        time: baseSession.time,
        duration: baseSession.duration,
        location: baseSession.location,
        creatorId: baseSession.creatorId,
        seriesId,
        recurrenceRule: baseSession.recurrenceRule,
        status: baseSession.status,
        reminderMinutesBefore: baseSession.reminderMinutesBefore,
        attendees: { ...baseSession.attendees },
        createdAt: baseSession.createdAt,
        updatedAt: baseSession.updatedAt,
      });

      sessions.push(session);

      // Increment by 7 days
      current.setDate(current.getDate() + 7);
    }

    return sessions;
  }
}
