import { IAcademicCatalogRepository } from '../../domain/repositories';
import { Subject } from '../../domain/models';

export class GetAllSubjects {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(): Promise<Subject[]> {
    return await this.catalogRepo.getAllSubjects();
  }
}
