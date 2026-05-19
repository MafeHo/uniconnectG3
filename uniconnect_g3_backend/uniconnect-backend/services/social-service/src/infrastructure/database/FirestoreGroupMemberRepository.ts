import { IGroupMemberRepository } from '../../domain/repositories';
import { GroupMember } from '../../domain/GroupMember';
import * as admin from 'firebase-admin';

export class FirestoreGroupMemberRepository implements IGroupMemberRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findByGroupId(groupId: string): Promise<GroupMember[]> {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as GroupMember[];
  }

  async findByUserId(userId: string, role?: string): Promise<GroupMember[]> {
    let query = this.db.collection('group_members').where('userId', '==', userId);
    if (role) {
      query = query.where('role', '==', role);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as GroupMember[];
  }

  async findByGroupAndUser(groupId: string, userId: string): Promise<GroupMember | null> {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as unknown as GroupMember;
  }

  async add(memberData: Partial<GroupMember>): Promise<void> {
    await this.db.collection('group_members').add({
      groupId: memberData.groupId,
      userId: memberData.userId,
      role: memberData.role || 'student',
      joinedAt: memberData.joinedAt || new Date()
    });
  }

  async remove(groupId: string, userId: string): Promise<boolean> {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return false;
    await snapshot.docs[0].ref.delete();
    return true;
  }

  async updateRole(groupId: string, userId: string, newRole: string): Promise<boolean> {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return false;
    await snapshot.docs[0].ref.update({ role: newRole });
    return true;
  }

  async getRefsByGroupAndUser(groupId: string, userId: string): Promise<{ ref: admin.firestore.DocumentReference, data: admin.firestore.DocumentData } | null> {
    const snapshot = await this.db.collection('group_members')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .get();
    if (snapshot.empty) return null;
    return {
      ref: snapshot.docs[0].ref,
      data: snapshot.docs[0].data()
    };
  }
}
export default FirestoreGroupMemberRepository;
