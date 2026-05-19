import * as admin from 'firebase-admin';

class DatabaseSingleton {
  public static instance: DatabaseSingleton;
  public firestoreDb!: admin.firestore.Firestore;
  public relationalDb: unknown = null;

  constructor() {
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }

    this._initializeFirebase();
    this.firestoreDb = admin.firestore();
    DatabaseSingleton.instance = this;
  }

  private _initializeFirebase(): void {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
        try {
          privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
        } catch (e) {
          console.error('ERROR: Failed to decode FIREBASE_PRIVATE_KEY_BASE64');
        }
      }

      if (!projectId || !privateKey || !clientEmail) {
        console.error('ERROR: Missing Firebase environment variables:', {
          projectId: !!projectId,
          privateKey: !!privateKey,
          clientEmail: !!clientEmail
        });
      }

      const formattedKey = privateKey?.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: formattedKey,
          clientEmail,
        }),
      });
    }
  }

  public getFirestore(): admin.firestore.Firestore {
    return this.firestoreDb;
  }

  public getRelationalDb(): unknown {
    if (!this.relationalDb) {
      throw new Error("Relational database not initialized yet");
    }
    return this.relationalDb;
  }
}

const dbInstance = new DatabaseSingleton();
const db = dbInstance.getFirestore();

export { db, dbInstance, DatabaseSingleton };
