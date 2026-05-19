import * as admin from 'firebase-admin';
import { IAcademicProfileRepository, AcademicProfile } from '../../domain/repositories';

export default class FirestoreAcademicProfileRepository implements IAcademicProfileRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async findByStudentId(studentId: string): Promise<AcademicProfile | null> {
    const doc = await this.db.collection('academic_profiles').doc(studentId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      studentId: data?.studentId || doc.id,
      mappingId: data?.mappingId || "",
      subjects: data?.subjects || [],
      updatedAt: data?.updatedAt instanceof admin.firestore.Timestamp ? data.updatedAt.toDate() : (data?.updatedAt ? new Date(data.updatedAt) : new Date())
    } as AcademicProfile;
  }

  async save(studentId: string, profileData: Partial<AcademicProfile>): Promise<void> {
    await this.db.collection('academic_profiles').doc(studentId).set(profileData, { merge: true });
  }

  async findBySubjectFilter(subjectIds: string[] | null): Promise<AcademicProfile[]> {
    let query: admin.firestore.Query = this.db.collection('academic_profiles');
    if (subjectIds && subjectIds.length > 0) {
      query = query.where('subjects', 'array-contains-any', subjectIds);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        studentId: data.studentId || doc.id,
        mappingId: data.mappingId || "",
        subjects: data.subjects || [],
        updatedAt: data.updatedAt instanceof admin.firestore.Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date())
      } as AcademicProfile;
    });
  }
}
