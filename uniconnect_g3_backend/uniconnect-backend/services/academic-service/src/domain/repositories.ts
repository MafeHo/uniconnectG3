import {
  Faculty,
  Career,
  Subject,
  Section,
  AcademicLevel,
  FormationLevel,
  AcademicMapping,
} from './models';

export interface IAcademicCatalogRepository {
  getAllFaculties(): Promise<Faculty[]>;
  getAllCareers(): Promise<Career[]>;
  getAllSubjects(): Promise<Subject[]>;
  getSubjectById(id: string): Promise<Subject | null>;
  getSubjectsByIds(ids: string[]): Promise<Array<Partial<Subject> & { id: string; exists: boolean }>>;
  getSectionsByCareerId(careerId: string): Promise<Section[]>;
  getMappingsByFilter(filter: {
    facultyId?: string;
    academicLevelId?: string;
    formationLevelId?: string;
    careerId?: string;
  }): Promise<AcademicMapping[]>;
  getMappingById(id: string): Promise<AcademicMapping | null>;
  getAcademicLevelById(id: string): Promise<AcademicLevel | null>;
  getFormationLevelById(id: string): Promise<FormationLevel | null>;
  getFacultyById(id: string): Promise<Faculty | null>;
  getCareerById(id: string): Promise<Career | null>;
  getAcademicLevelsByIds(ids: string[]): Promise<AcademicLevel[]>;
  getFormationLevelsByIds(ids: string[]): Promise<FormationLevel[]>;
  getCareersByIds(ids: string[]): Promise<Career[]>;
}
