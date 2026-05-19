import { IAcademicCatalogRepository } from '../../domain/repositories';
import { Career } from '../../domain/models';

export class GetCareersByPath {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(facultyId: string, academicLevelId: string, formationLevelId: string): Promise<Career[]> {
    // Obtener mappings filtrados por ruta académica completa
    const mappings = await this.catalogRepo.getMappingsByFilter({
      facultyId,
      academicLevelId,
      formationLevelId
    });
    
    // Extraer IDs de carreras
    const careerIds = mappings.map(m => m.careerId);
    
    // Obtener datos de cada carrera
    return await this.catalogRepo.getCareersByIds(careerIds);
  }
}
