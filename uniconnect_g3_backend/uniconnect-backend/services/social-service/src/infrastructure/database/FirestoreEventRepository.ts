import { IEventRepository } from '../../domain/repositories';
import { Event } from '../../domain/Event';
import * as admin from 'firebase-admin';

export class FirestoreEventRepository implements IEventRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findAll(categoryId: string | null = null): Promise<Event[]> {
    let query: admin.firestore.Query = this.db.collection('events');
    if (categoryId) {
      query = query.where('type', '==', categoryId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    const docRef = await this.db.collection('events').add(eventData);
    return { id: docRef.id, ...eventData } as Event;
  }
}
export default FirestoreEventRepository;
