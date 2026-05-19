import * as admin from 'firebase-admin';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';

export class FirestoreTokenRepository implements ITokenRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getTokensByUserId(userId: string): Promise<string[]> {
    try {
      const snapshot = await this.db.collection('users').doc(userId).collection('fcm_tokens').get();
      if (snapshot.empty) {
        const userDoc = await this.db.collection('users').doc(userId).get();
        const data = userDoc.exists ? userDoc.data() : null;
        if (data && data.fcm_token) {
          return [data.fcm_token];
        }
        return [];
      }
      return snapshot.docs.map(doc => doc.data().token);
    } catch (error) {
      console.error(`Error getting tokens for user ${userId}:`, error);
      return [];
    }
  }

  async saveToken(userId: string, token: string): Promise<void> {
    try {
      const tokenId = Buffer.from(token).toString('base64').substring(0, 32);
      await this.db.collection('users').doc(userId).collection('fcm_tokens').doc(tokenId).set({
        token,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error saving token for user ${userId}:`, error);
    }
  }

  async removeToken(token: string): Promise<void> {
    try {
      const snapshot = await this.db.collectionGroup('fcm_tokens').where('token', '==', token).get();
      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error(`Error removing token:`, error);
    }
  }
}
