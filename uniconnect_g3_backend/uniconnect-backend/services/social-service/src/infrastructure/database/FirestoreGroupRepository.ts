import { IGroupRepository } from '../../domain/repositories';
import { Group } from '../../domain/Group';
import * as admin from 'firebase-admin';

export class FirestoreGroupRepository implements IGroupRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findById(groupId: string): Promise<Group | null> {
    const doc = await this.db.collection('groups').doc(groupId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Group;
  }

  async create(groupData: Partial<Group>): Promise<Group> {
    const groupRef = this.db.collection('groups').doc();
    const newGroup = {
      id: groupRef.id,
      name: groupData.name,
      subjectId: groupData.subjectId,
      description: groupData.description || '',
      creatorId: groupData.creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await groupRef.set(newGroup);
    return newGroup as Group;
  }

  async update(groupId: string, data: Partial<Group>): Promise<Group | null> {
    const docRef = this.db.collection('groups').doc(groupId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updateData = { ...data, updatedAt: new Date() };
    await docRef.update(updateData);
    return { id: doc.id, ...doc.data(), ...updateData } as Group;
  }

  async delete(groupId: string): Promise<boolean> {
    const docRef = this.db.collection('groups').doc(groupId);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async findAll(): Promise<Group[]> {
    const snapshot = await this.db.collection('groups').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[];
  }

  async findByName(name: string): Promise<Group | null> {
    const snapshot = await this.db.collection('groups')
      .where('name', '==', name)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Group;
  }

  async updateCreatorId(groupId: string, newCreatorId: string): Promise<void> {
    await this.db.collection('groups').doc(groupId).update({ creatorId: newCreatorId });
  }

  async countBySubjectId(subjectId: string): Promise<number> {
    const snapshot = await this.db.collection('groups')
      .where('subjectId', '==', subjectId)
      .get();
    return snapshot.size;
  }
}
export default FirestoreGroupRepository;
