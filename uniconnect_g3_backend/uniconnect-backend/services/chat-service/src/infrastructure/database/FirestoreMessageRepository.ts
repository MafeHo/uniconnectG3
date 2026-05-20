import { IMessageRepository } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreMessageRepository implements IMessageRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findByChatId(chatId: string): Promise<Record<string, unknown>[]> {
    const snapshot = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Record<string, unknown>));
  }

  async findWithPagination(chatId: string, limitCount = 20, lastMessageId: string | null = null): Promise<Record<string, unknown>[]> {
    let query: admin.firestore.Query = this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limitCount);

    if (lastMessageId) {
      const lastMessageDoc = await this.db
        .collection('chats')
        .doc(chatId)
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

  async getMessagesSince(chatId: string, timestamp: number | string | Date): Promise<Record<string, unknown>[]> {
    const dateObj = new Date(timestamp);
    const snapshot = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .where('createdAt', '>', dateObj)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Record<string, unknown>));
  }

  async create(chatId: string, messageData: Record<string, unknown>): Promise<void> {
    await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        ...messageData,
        createdAt: new Date()
      });
  }

  async getById(chatId: string, messageId: string): Promise<Record<string, unknown> | null> {
    const doc = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Record<string, unknown>;
  }

  async update(chatId: string, messageId: string, data: Record<string, unknown>): Promise<void> {
    await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .update(data);
  }
}
