import { IChatRepository } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreChatRepository implements IChatRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findById(chatId: string): Promise<Record<string, unknown> | null> {
    const doc = await this.db.collection('chats').doc(chatId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Record<string, unknown>;
  }

  async create(chatId: string, chatData: { participants: string[]; lastMessage?: string }): Promise<void> {
    await this.db.collection('chats').doc(chatId).set({
      participants: chatData.participants,
      lastMessage: chatData.lastMessage || '',
      updatedAt: new Date()
    });
  }

  async updateLastMessage(chatId: string, text: string): Promise<void> {
    await this.db.collection('chats').doc(chatId).set({
      lastMessage: text,
      updatedAt: new Date()
    }, { merge: true });
  }

  async findByUserId(userId: string): Promise<Record<string, unknown>[]> {
    const snapshot = await this.db.collection('chats')
      .where('participants', 'array-contains', userId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record<string, unknown>));
  }
}
