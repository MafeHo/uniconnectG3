import { User, Estadisticas } from '@uniconnect/shared';

export interface AcademicProfile {
  studentId: string;
  mappingId: string;
  subjects: string[];
  updatedAt: Date;
  facultyId?: string;
  academicLevelId?: string;
  formationLevelId?: string;
  careerId?: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Career {
  id: string;
  name: string;
}

export interface AcademicLevel {
  id: string;
  name: string;
}

export interface FormationLevel {
  id: string;
  name: string;
}

export interface AcademicMapping {
  id: string;
  facultyId: string;
  academicLevelId: string;
  formationLevelId: string;
  careerId: string;
}

export interface Subject {
  id: string;
  name: string;
  exists?: boolean;
}

export interface IUserRepository {
  findById(uid: string): Promise<User | null>;
  save(uid: string, data: Partial<User>): Promise<void>;
  findByUids(uids: string[]): Promise<User[]>;
}

export interface IAcademicProfileRepository {
  findByStudentId(studentId: string): Promise<AcademicProfile | null>;
  save(studentId: string, data: Partial<AcademicProfile>): Promise<void>;
  findBySubjectFilter(subjects: string[] | null): Promise<AcademicProfile[]>;
}

export interface IAcademicCatalogRepository {
  getMappingById(id: string): Promise<AcademicMapping | null>;
  getFacultyById(id: string): Promise<Faculty | null>;
  getAcademicLevelById(id: string): Promise<AcademicLevel | null>;
  getFormationLevelById(id: string): Promise<FormationLevel | null>;
  getCareerById(id: string): Promise<Career | null>;
  getSubjectsByIds(ids: string[]): Promise<Subject[]>;
  getMappingsByFilter(filter: Partial<AcademicMapping>): Promise<AcademicMapping[]>;
}

export interface IStatsRepository {
  getStudentStats(studentId: string): Promise<Estadisticas>;
}
