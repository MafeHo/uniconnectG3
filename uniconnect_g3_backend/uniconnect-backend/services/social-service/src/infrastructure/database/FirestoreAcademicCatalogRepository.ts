import { IAcademicCatalogRepository, Subject } from '../../domain/repositories';
import * as admin from 'firebase-admin';

export class FirestoreAcademicCatalogRepository implements IAcademicCatalogRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getAllFaculties(): Promise<Record<string, unknown>[]> {
    const snapshot = await this.db.collection('faculties').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllCareers(): Promise<Record<string, unknown>[]> {
    const snapshot = await this.db.collection('careers').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllSubjects(): Promise<Subject[]> {
    const snapshot = await this.db.collection('subjects').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    const doc = await this.db.collection('subjects').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Subject;
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    return this.findSubjectById(id);
  }

  async findSubjectsByIds(ids: string[]): Promise<Subject[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('subjects').doc(id).get())
    );
    return docs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Subject[];
  }

  async getSectionsByCareerId(careerId: string): Promise<Record<string, unknown>[]> {
    const snapshot = await this.db.collection('sections')
      .where('careerId', '==', careerId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getMappingsByFilter(filter: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    let query: admin.firestore.Query = this.db.collection('academic_mappings');
    if (filter.facultyId) {
      query = query.where('facultyId', '==', filter.facultyId);
    }
    if (filter.academicLevelId) {
      query = query.where('academicLevelId', '==', filter.academicLevelId);
    }
    if (filter.formationLevelId) {
      query = query.where('formationLevelId', '==', filter.formationLevelId);
    }
    if (filter.careerId) {
      query = query.where('careerId', '==', filter.careerId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getMappingById(id: string): Promise<Record<string, unknown> | null> {
    const doc = await this.db.collection('academic_mappings').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getAcademicLevelById(id: string): Promise<Record<string, unknown> | null> {
    if (!id) return null;
    const doc = await this.db.collection('academic_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getFormationLevelById(id: string): Promise<Record<string, unknown> | null> {
    if (!id) return null;
    const doc = await this.db.collection('formation_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getFacultyById(id: string): Promise<Record<string, unknown> | null> {
    if (!id) return null;
    const doc = await this.db.collection('faculties').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getCareerById(id: string): Promise<Record<string, unknown> | null> {
    if (!id) return null;
    const doc = await this.db.collection('careers').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getAcademicLevelsByIds(ids: string[]): Promise<Record<string, unknown>[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('academic_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getFormationLevelsByIds(ids: string[]): Promise<Record<string, unknown>[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('formation_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCareersByIds(ids: string[]): Promise<Record<string, unknown>[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('careers').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
export default FirestoreAcademicCatalogRepository;
