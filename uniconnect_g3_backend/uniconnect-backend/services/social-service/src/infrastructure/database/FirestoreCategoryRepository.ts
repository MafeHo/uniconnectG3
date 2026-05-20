import { ICategoryRepository, Category } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreCategoryRepository implements ICategoryRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findAll(): Promise<Category[]> {
    const snapshot = await this.db.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
  }

  async findById(id: string): Promise<Category | null> {
    const doc = await this.db.collection('categories').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Category;
  }
}
export default FirestoreCategoryRepository;
