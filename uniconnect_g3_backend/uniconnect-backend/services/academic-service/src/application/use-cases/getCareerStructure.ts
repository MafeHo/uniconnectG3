import { IAcademicCatalogRepository } from '../../domain/repositories';
import { Subject } from '../../domain/models';

export interface StructureSection {
  sectionId: string;
  sectionName: string;
  subjects: Subject[];
}

export class GetCareerStructure {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(careerId: string): Promise<StructureSection[]> {
    // 1. Obtener secciones de la carrera
    const sections = await this.catalogRepo.getSectionsByCareerId(careerId);

    if (sections.length === 0) {
      throw new Error('STRUCTURE_NOT_FOUND');
    }

    // 2. Obtener TODAS las materias
    const allSubjects = await this.catalogRepo.getAllSubjects();

    // 3. Organizar materias dentro de sus secciones
    const structure: StructureSection[] = sections.map(section => {
      const sectionSubjects = allSubjects.filter(sub =>
        String(sub.sectionId || '').trim() === String(section.id).trim()
      );

      return {
        sectionId: section.id,
        sectionName: section.name,
        subjects: sectionSubjects
      };
    });

    return structure;
  }
}
