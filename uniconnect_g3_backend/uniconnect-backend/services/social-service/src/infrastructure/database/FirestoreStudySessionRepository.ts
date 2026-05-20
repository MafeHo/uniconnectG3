import { IStudySessionRepository } from '../../domain/repositories';
import { StudySession } from '../../domain/StudySession';
import * as admin from 'firebase-admin';

export class FirestoreStudySessionRepository implements IStudySessionRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  private _mapDocument(doc: admin.firestore.DocumentSnapshot): StudySession {
    const data = doc.data() || {};
    return new StudySession({
      id: doc.id,
      groupId: data.groupId,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      duration: data.duration,
      location: data.location,
      creatorId: data.creatorId,
      seriesId: data.seriesId,
      recurrenceRule: data.recurrenceRule,
      status: data.status,
      reminderMinutesBefore: data.reminderMinutesBefore,
      attendees: data.attendees,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
  }

  async create(session: StudySession): Promise<string> {
    const data = {
      groupId: session.groupId,
      title: session.title,
      description: session.description,
      date: session.date,
      time: session.time,
      duration: session.duration,
      location: session.location,
      creatorId: session.creatorId,
      seriesId: session.seriesId,
      recurrenceRule: session.recurrenceRule,
      status: session.status,
      reminderMinutesBefore: session.reminderMinutesBefore,
      attendees: session.attendees,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.db
      .collection('groups')
      .doc(session.groupId)
      .collection('study_sessions')
      .add(data);

    return docRef.id;
  }

  async createBatch(sessions: StudySession[]): Promise<string[]> {
    const batch = this.db.batch();
    const ids: string[] = [];

    for (const session of sessions) {
      const docRef = this.db
        .collection('groups')
        .doc(session.groupId)
        .collection('study_sessions')
        .doc();
      
      const id = docRef.id;
      session.id = id;

      const data = {
        groupId: session.groupId,
        title: session.title,
        description: session.description,
        date: session.date,
        time: session.time,
        duration: session.duration,
        location: session.location,
        creatorId: session.creatorId,
        seriesId: session.seriesId,
        recurrenceRule: session.recurrenceRule,
        status: session.status,
        reminderMinutesBefore: session.reminderMinutesBefore,
        attendees: session.attendees,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(docRef, data);
      ids.push(id);
    }

    await batch.commit();
    return ids;
  }

  async findByGroupId(groupId: string): Promise<StudySession[]> {
    const snapshot = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('study_sessions')
      .where('status', '==', 'scheduled')
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => this._mapDocument(doc));
  }

  async findById(groupId: string, sessionId: string): Promise<StudySession | null> {
    const doc = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('study_sessions')
      .doc(sessionId)
      .get();

    if (!doc.exists) {
      return null;
    }
    return this._mapDocument(doc);
  }

  async update(groupId: string, sessionId: string, data: Partial<StudySession>): Promise<void> {
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // We shouldn't try to update id or groupId or read-only properties
    delete updateData.id;
    delete updateData.groupId;

    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('study_sessions')
      .doc(sessionId)
      .update(updateData);
  }

  async cancelById(groupId: string, sessionId: string): Promise<void> {
    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('study_sessions')
      .doc(sessionId)
      .update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async findUpcoming(minutesBefore: number): Promise<StudySession[]> {
    // Para evitar errores de precondición (FAILED_PRECONDITION) por falta de índices compuestos o exemptions en colección de grupo local o real,
    // primero recuperamos todos los grupos y luego consultamos las subcolecciones de cada uno de manera paralela y segura.
    const groupsSnap = await this.db.collection('groups').get();
    const promises = groupsSnap.docs.map(groupDoc => 
      this.db
        .collection('groups')
        .doc(groupDoc.id)
        .collection('study_sessions')
        .where('status', '==', 'scheduled')
        .get()
    );
    const snapshots = await Promise.all(promises);
    const docs = snapshots.flatMap(snap => snap.docs);

    const now = Date.now();
    const limit = now + minutesBefore * 60 * 1000;

    const upcoming: StudySession[] = [];
    for (const doc of docs) {
      const session = this._mapDocument(doc);
      try {
        const parts = session.date.split('-');
        const timeParts = session.time.split(':');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const hour = parseInt(timeParts[0], 10);
        const min = parseInt(timeParts[1], 10);

        const sessionDateObj = new Date(year, month, day, hour, min);
        const reminderTime = sessionDateObj.getTime() - (session.reminderMinutesBefore * 60 * 1000);

        if (reminderTime > now - 5000 && reminderTime <= limit) {
          upcoming.push(session);
        }
      } catch (err) {
        console.error('[FirestoreStudySessionRepository] Error parsing date for session:', session.id, err);
      }
    }
    return upcoming;
  }

  async findBySeriesId(groupId: string, seriesId: string): Promise<StudySession[]> {
    const snapshot = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('study_sessions')
      .where('seriesId', '==', seriesId)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => this._mapDocument(doc));
  }
}
export default FirestoreStudySessionRepository;
