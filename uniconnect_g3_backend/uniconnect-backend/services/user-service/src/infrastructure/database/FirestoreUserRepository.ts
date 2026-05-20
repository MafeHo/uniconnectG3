import * as admin from 'firebase-admin';
import { User } from '@uniconnect/shared';
import { IUserRepository } from '../../domain/repositories';

export default class FirestoreUserRepository implements IUserRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findById(userId: string): Promise<User | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as unknown as User;
  }

  async findByIds(userIds: string[]): Promise<Array<User & { exists: boolean }>> {
    if (!userIds || userIds.length === 0) return [];
    const docs = await Promise.all(
      userIds.map(id => this.db.collection('users').doc(id).get())
    );
    return docs.map(doc => ({
      id: doc.id,
      exists: doc.exists,
      ...(doc.exists ? doc.data() : {})
    })) as unknown as Array<User & { exists: boolean }>;
  }

  async save(userId: string, userData: Partial<User>): Promise<void> {
    await this.db.collection('users').doc(userId).set(userData, { merge: true });
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as User[];
  }

  async findByUids(uids: string[]): Promise<User[]> {
    if (!uids || uids.length === 0) return [];
    // Firestore 'in' query limitado a 10 elementos
    const snapshot = await this.db.collection('users')
      .where('uid', 'in', uids.slice(0, 10))
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as User[];
  }
}
