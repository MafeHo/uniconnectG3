import { IAcademicCatalogRepository } from '../../domain/repositories';
import { FormationLevel } from '../../domain/models';

export class GetFormationLevels {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(facultyId: string, academicLevelId: string): Promise<FormationLevel[]> {
    // Obtener mappings filtrados por facultad y nivel académico
    const mappings = await this.catalogRepo.getMappingsByFilter({ facultyId, academicLevelId });
    
    // Extraer IDs únicos de niveles de formación
    const formationIds = [...new Set(mappings.map(m => m.formationLevelId))];
    
    // Obtener los datos de cada nivel de formación
    return await this.catalogRepo.getFormationLevelsByIds(formationIds);
  }
}
