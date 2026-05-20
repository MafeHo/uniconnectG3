import * as admin from 'firebase-admin';
import { IAcademicCatalogRepository } from '../../domain/repositories';
import {
  Faculty,
  Career,
  Subject,
  Section,
  AcademicLevel,
  FormationLevel,
  AcademicMapping,
} from '../../domain/models';

export class FirestoreAcademicCatalogRepository implements IAcademicCatalogRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getAllFaculties(): Promise<Faculty[]> {
    const snapshot = await this.db.collection('faculties').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faculty));
  }

  async getAllCareers(): Promise<Career[]> {
    const snapshot = await this.db.collection('careers').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Career));
  }

  async getAllSubjects(): Promise<Subject[]> {
    const snapshot = await this.db.collection('subjects').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const doc = await this.db.collection('subjects').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Subject;
  }

  async getSubjectsByIds(ids: string[]): Promise<Array<Partial<Subject> & { id: string; exists: boolean }>> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('subjects').doc(id).get())
    );
    return docs.map(doc => ({
      id: doc.id,
      exists: doc.exists,
      ...(doc.exists ? doc.data() : {})
    })) as Array<Partial<Subject> & { id: string; exists: boolean }>;
  }

  async getSectionsByCareerId(careerId: string): Promise<Section[]> {
    const snapshot = await this.db.collection('sections')
      .where('careerId', '==', careerId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
  }

  async getMappingsByFilter(filter: {
    facultyId?: string;
    academicLevelId?: string;
    formationLevelId?: string;
    careerId?: string;
  }): Promise<AcademicMapping[]> {
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicMapping));
  }

  async getMappingById(id: string): Promise<AcademicMapping | null> {
    const doc = await this.db.collection('academic_mappings').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as AcademicMapping;
  }

  async getAcademicLevelById(id: string): Promise<AcademicLevel | null> {
    if (!id) return null;
    const doc = await this.db.collection('academic_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as AcademicLevel;
  }

  async getFormationLevelById(id: string): Promise<FormationLevel | null> {
    if (!id) return null;
    const doc = await this.db.collection('formation_levels').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as FormationLevel;
  }

  async getFacultyById(id: string): Promise<Faculty | null> {
    if (!id) return null;
    const doc = await this.db.collection('faculties').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Faculty;
  }

  async getCareerById(id: string): Promise<Career | null> {
    if (!id) return null;
    const doc = await this.db.collection('careers').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Career;
  }

  async getAcademicLevelsByIds(ids: string[]): Promise<AcademicLevel[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('academic_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() } as AcademicLevel));
  }

  async getFormationLevelsByIds(ids: string[]): Promise<FormationLevel[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('formation_levels').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() } as FormationLevel));
  }

  async getCareersByIds(ids: string[]): Promise<Career[]> {
    if (!ids || ids.length === 0) return [];
    const docs = await Promise.all(
      ids.map(id => this.db.collection('careers').doc(id).get())
    );
    return docs.filter(d => d.exists).map(doc => ({ id: doc.id, ...doc.data() } as Career));
  }
}
