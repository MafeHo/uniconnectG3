import { IGroupMessageRepository } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreGroupMessageRepository implements IGroupMessageRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async create(groupId: string, messageData: Record<string, unknown>): Promise<string> {
    console.log(`[DB Debug] Intentando crear mensaje para grupo: ${groupId}`);
    try {
      const docRef = await this.db
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .add({
          ...messageData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`[DB Debug] Mensaje creado con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`[DB Debug] ERROR al crear mensaje en Firestore:`, error);
      throw error;
    }
  }

  async findWithPagination(groupId: string, limitCount = 20, lastMessageId: string | null = null): Promise<Record<string, unknown>[]> {
    let query: admin.firestore.Query = this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limitCount);

    if (lastMessageId) {
      const lastMessageDoc = await this.db
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .doc(lastMessageId)
        .get();

      if (lastMessageDoc.exists) {
        query = query.startAfter(lastMessageDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Record<string, unknown>)).reverse();
  }

  async getMessagesSince(groupId: string, timestamp: number | string | Date): Promise<Record<string, unknown>[]> {
    const dateObj = new Date(timestamp);
    const snapshot = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .where('createdAt', '>', dateObj)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Record<string, unknown>));
  }

  async getById(groupId: string, messageId: string): Promise<Record<string, unknown> | null> {
    const doc = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Record<string, unknown>;
  }

  async update(groupId: string, messageId: string, data: Record<string, unknown>): Promise<void> {
    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .doc(messageId)
      .update(data);
  }
}
