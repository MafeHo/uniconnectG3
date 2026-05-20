import { IAcademicCatalogRepository } from '../../domain/repositories';
import { Faculty } from '../../domain/models';

export class GetAllFaculties {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(): Promise<Faculty[]> {
    return await this.catalogRepo.getAllFaculties();
  }
}
