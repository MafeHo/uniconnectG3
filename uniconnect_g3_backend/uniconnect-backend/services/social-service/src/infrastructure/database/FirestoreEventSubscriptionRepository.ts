import { IEventSubscriptionRepository } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreEventSubscriptionRepository implements IEventSubscriptionRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getSubscriptionsByUser(userId: string): Promise<string[]> {
    const doc = await this.db.collection('event_subscriptions').doc(userId).get();
    if (!doc.exists) return [];
    return doc.data()?.categoryIds || [];
  }

  async getUsersSubscribedToCategory(categoryId: string): Promise<string[]> {
    const snapshot = await this.db.collection('event_subscriptions')
      .where('categoryIds', 'array-contains', categoryId)
      .get();
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => doc.id);
  }

  async subscribe(userId: string, categoryId: string): Promise<void> {
    const docRef = this.db.collection('event_subscriptions').doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      await docRef.set({ categoryIds: [categoryId] });
    } else {
      const categoryIds = doc.data()?.categoryIds || [];
      if (!categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
        await docRef.update({ categoryIds });
      }
    }
  }

  async unsubscribe(userId: string, categoryId: string): Promise<void> {
    const docRef = this.db.collection('event_subscriptions').doc(userId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      let categoryIds = doc.data()?.categoryIds || [];
      categoryIds = categoryIds.filter((id: string) => id !== categoryId);
      await docRef.update({ categoryIds });
    }
  }

  async findByUser(userId: string): Promise<{ categoryId: string }[]> {
    const subs = await this.getSubscriptionsByUser(userId);
    return subs.map(sub => ({ categoryId: sub }));
  }
}
export default FirestoreEventSubscriptionRepository;
