import { User } from '@uniconnect/shared';
import { IAcademicProfileRepository, IUserRepository } from '../../domain/repositories';

export interface SearchStudentResult extends User {
  materiasIds: string[];
}

export default class SearchStudents {
  private academicProfileRepo: IAcademicProfileRepository;
  private userRepo: IUserRepository;

  constructor(academicProfileRepo: IAcademicProfileRepository, userRepo: IUserRepository) {
    this.academicProfileRepo = academicProfileRepo;
    this.userRepo = userRepo;
  }

  async execute({ name, subjectId, excludeId }: { name?: string; subjectId?: string; excludeId?: string }): Promise<SearchStudentResult[]> {
    // Filtrar perfiles académicos por materia
    let subjectIdsArray: string[] = [];
    if (subjectId) {
      subjectIdsArray = subjectId.split(',');
    }

    const profiles = await this.academicProfileRepo.findBySubjectFilter(
      subjectIdsArray.length > 0 ? subjectIdsArray : null
    );

    if (profiles.length === 0) return [];

    let filteredProfiles = profiles;

    // Intersección manual si se buscan múltiples materias
    if (subjectId && subjectId.includes(',')) {
      filteredProfiles = filteredProfiles.filter(p =>
        subjectIdsArray.every(id => p.subjects.includes(id))
      );
    }

    const studentIds = filteredProfiles.map(p => p.studentId);
    if (studentIds.length === 0) return [];

    // Traer datos de usuarios (limitado a 10)
    const users = await this.userRepo.findByUids(studentIds.slice(0, 10));

    let results = users.map(userData => {
      const userProfile = filteredProfiles.find(p => p.studentId === userData.uid);
      return {
        ...userData,
        id: userData.id || userData.uid,
        materiasIds: userProfile ? userProfile.subjects : []
      } as unknown as SearchStudentResult;
    });

    // Filtros finales en memoria
    if (excludeId) results = results.filter(u => u.uid !== excludeId && u.id !== excludeId);
    if (name) {
      const searchName = name.toLowerCase();
      results = results.filter(u => u.name?.toLowerCase().includes(searchName));
    }

    return results;
  }
}
