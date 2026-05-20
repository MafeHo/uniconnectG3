import * as admin from 'firebase-admin';
import { INotificationRepository, INotificationWithId } from '../../application/use-cases/MarkNotificationAsRead';
import { INotificacionDTO } from '../../domain/entities/INotificacion';

export class FirestoreNotificationRepository implements INotificationRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async save(notification: INotificacionDTO): Promise<string> {
    const data = typeof (notification as any).toFirestore === 'function' ? (notification as any).toFirestore() : notification;
    const docRef = this.db.collection('notifications').doc();
    await docRef.set(data);
    return docRef.id;
  }

  async findById(notificationId: string): Promise<INotificationWithId | null> {
    const doc = await this.db.collection('notifications').doc(notificationId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as INotificationWithId;
  }

  async findByUserId(userId: string, limit: number = 20): Promise<INotificationWithId[]> {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('priorityWeight', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as INotificationWithId));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.db.collection('notifications').doc(notificationId).update({
      status: 'read'
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();

    if (snapshot.empty) return;

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'read' });
    });
    await batch.commit();
  }

  async countUnread(userId: string): Promise<number> {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();
    return snapshot.size;
  }
}
