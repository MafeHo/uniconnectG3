import { IResourceRepository } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreResourceRepository implements IResourceRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  private _mapDocument(doc: admin.firestore.DocumentSnapshot): Record<string, unknown> {
    const data = doc.data() || {};
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    };
  }

  async create(groupId: string, data: Record<string, unknown>): Promise<string> {
    // Eliminar campos id para que no se guarden duplicados
    const { id, ...cleanData } = data;
    const docRef = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('resources')
      .add({
        ...cleanData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return docRef.id;
  }

  async findById(groupId: string, resourceId: string): Promise<Record<string, unknown> | null> {
    const doc = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('resources')
      .doc(resourceId)
      .get();

    if (!doc.exists) {
      return null;
    }
    return this._mapDocument(doc);
  }

  async findByGroupId(groupId: string, filters?: { type?: string }): Promise<Record<string, unknown>[]> {
    let query: admin.firestore.Query = this.db
      .collection('groups')
      .doc(groupId)
      .collection('resources');

    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => this._mapDocument(doc));
  }

  async update(groupId: string, resourceId: string, data: Partial<Record<string, unknown>>): Promise<void> {
    const { id, ...cleanData } = data;
    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('resources')
      .doc(resourceId)
      .update({
        ...cleanData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async delete(groupId: string, resourceId: string): Promise<void> {
    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('resources')
      .doc(resourceId)
      .delete();
  }
}
