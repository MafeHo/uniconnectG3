import * as admin from 'firebase-admin';
import { IPreferenceRepository, UserPreferences } from '../../application/use-cases/SendNotification';

export class FirestorePreferenceRepository implements IPreferenceRepository {
  private db: admin.firestore.Firestore;
  private collectionName: string;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
    this.collectionName = 'notification_preferences';
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const doc = await this.db.collection(this.collectionName).doc(userId).get();
      
      if (!doc.exists) {
        return {
          userId,
          enabledChannels: {
            in_app: true,
            email: true,
            push: true
          }
        };
      }

      const data = doc.data() || {};
      return {
        userId,
        enabledChannels: data.enabledChannels || {
          in_app: true,
          email: true,
          push: true
        }
      };
    } catch (error) {
      console.error(`Error fetching preferences for user ${userId}:`, error);
      return {
        userId,
        enabledChannels: {
          in_app: true,
          email: true,
          push: true
        }
      };
    }
  }
}
