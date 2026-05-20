import { IGroupMemberRepository, User } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreGroupMemberRepository implements IGroupMemberRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getGroupMembersWithNames(groupId: string): Promise<User[]> {
    const snapshot = await this.db
      .collection('group_members')
      .where('groupId', '==', groupId)
      .get();
      
    if (snapshot.empty) return [];

    const userIds = snapshot.docs.map(doc => doc.data().userId as string);

    const users: User[] = [];
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const userSnap = await this.db
        .collection('users')
        .where('__name__', 'in', chunk)
        .get();
      
      userSnap.docs.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });
    }

    return users;
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const snapshot = await this.db
      .collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .get();
      
    return !snapshot.empty;
  }

  async getGroupsByUserId(userId: string): Promise<string[]> {
    const snapshot = await this.db
      .collection('group_members')
      .where('userId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => doc.data().groupId as string);
  }
}
