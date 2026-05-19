import { IGroupRequestRepository, GroupRequest } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreGroupRequestRepository implements IGroupRequestRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findPendingByGroupId(groupId: string): Promise<GroupRequest[]> {
    const snapshot = await this.db.collection('groups').doc(groupId)
      .collection('requests')
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GroupRequest[];
  }

  async findByGroupAndUser(groupId: string, userId: string): Promise<GroupRequest | null> {
    const doc = await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as GroupRequest;
  }

  async findByUserAndGroup(groupId: string, userId: string): Promise<GroupRequest | null> {
    const snapshot = await this.db.collection('group_requests')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GroupRequest;
  }

  async create(requestData: Partial<GroupRequest>): Promise<GroupRequest> {
    const { groupId, userId, userName } = requestData;

    if (!groupId || !userId) {
      throw new Error('Faltan IDs para crear la solicitud: groupId o userId');
    }

    const docData = {
      userId: userId,
      userName: userName,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .set(docData);

    return { groupId, ...docData } as GroupRequest;
  }

  async updateStatus(groupId: string, userId: string, status: string): Promise<void> {
    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .update({ status });
  }

  async deleteByUserAndGroup(groupId: string, userId: string): Promise<boolean> {
    const docRef = this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId);

    await docRef.delete();
    return true;
  }

  // Métodos requeridos por la interfaz común para cumplimiento de IGroupRequestRepository
  async createRequest(requestData: Partial<GroupRequest>): Promise<GroupRequest> {
    return this.create(requestData);
  }

  async findPendingByUserAndGroup(userId: string, groupId: string): Promise<GroupRequest | null> {
    return this.findByGroupAndUser(groupId, userId);
  }

  async findPendingByGroup(groupId: string): Promise<GroupRequest[]> {
    return this.findPendingByGroupId(groupId);
  }

  async findById(requestId: string): Promise<GroupRequest | null> {
    // Para simplificar, buscamos la solicitud de grupo por id o lo mapeamos
    const doc = await this.db.collection('group_requests').doc(requestId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as GroupRequest;
  }

  async deletePendingByUserId(userId: string): Promise<void> {
    const snapshot = await this.db.collection('group_requests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }
}
export default FirestoreGroupRequestRepository;
