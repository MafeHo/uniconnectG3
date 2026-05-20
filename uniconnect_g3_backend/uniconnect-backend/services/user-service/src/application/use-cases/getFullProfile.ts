import { User } from '@uniconnect/shared';
import { IAcademicProfileRepository, IUserRepository, IAcademicCatalogRepository, AcademicMapping, Subject, AcademicProfile } from '../../domain/repositories';

export default class GetFullProfile {
  private academicProfileRepo: IAcademicProfileRepository;
  private userRepo: IUserRepository;
  private catalogRepo: IAcademicCatalogRepository;

  constructor(
    academicProfileRepo: IAcademicProfileRepository,
    userRepo: IUserRepository,
    catalogRepo: IAcademicCatalogRepository
  ) {
    this.academicProfileRepo = academicProfileRepo;
    this.userRepo = userRepo;
    this.catalogRepo = catalogRepo;
  }

  async execute(studentId: string): Promise<User> {
    // Consultas en paralelo para mejor performance
    const [profileData, userData] = await Promise.all([
      this.academicProfileRepo.findByStudentId(studentId),
      this.userRepo.findById(studentId)
    ]);

    const profile: AcademicProfile = profileData || { studentId, mappingId: "", subjects: [] as string[], updatedAt: new Date() };
    const user: Partial<User> = userData || {};

    if (!userData && !profileData) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    // Resolver jerarquía desde academic_mappings si existe mappingId
    let mappingData: Partial<AcademicMapping> = {};
    if (profile.mappingId) {
      const mapping = await this.catalogRepo.getMappingById(profile.mappingId);
      if (mapping) {
        mappingData = mapping;
      }
    }

    // Usar mappingData si está disponible, fallback a profileData
    const facultyId = mappingData.facultyId || profile.facultyId;
    const academicLevelId = mappingData.academicLevelId || profile.academicLevelId;
    const formationLevelId = mappingData.formationLevelId || profile.formationLevelId;
    const careerId = mappingData.careerId || profile.careerId;

    // Consultas paralelas de catálogos
    const [faculty, academicLevel, formationLevel, career, subjectDocs] = await Promise.all([
      facultyId ? this.catalogRepo.getFacultyById(facultyId) : Promise.resolve(null),
      academicLevelId ? this.catalogRepo.getAcademicLevelById(academicLevelId) : Promise.resolve(null),
      formationLevelId ? this.catalogRepo.getFormationLevelById(formationLevelId) : Promise.resolve(null),
      careerId ? this.catalogRepo.getCareerById(careerId) : Promise.resolve(null),
      profile.subjects ? this.catalogRepo.getSubjectsByIds(profile.subjects) : Promise.resolve([] as Subject[])
    ]);

    return {
      ...user,
      ...profile,
      facultyId,
      academicLevelId,
      formationLevelId,
      careerId,
      userName: user.name || 'Sin nombre',
      facultyName: faculty ? faculty.name : 'No especificada',
      academicLevelName: academicLevel ? academicLevel.name : 'No especificado',
      formationLevelName: formationLevel ? formationLevel.name : 'No especificado',
      careerName: career ? career.name : 'No encontrada',
      subjectNames: subjectDocs.map((d: Subject) => d.exists !== false ? d.name : 'Materia desconocida')
    } as unknown as User;
  }
}
