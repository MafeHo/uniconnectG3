import { IAcademicCatalogRepository } from '../../domain/repositories';
import { Career } from '../../domain/models';

export class GetAllCareers {
  private catalogRepo: IAcademicCatalogRepository;

  constructor(catalogRepo: IAcademicCatalogRepository) {
    this.catalogRepo = catalogRepo;
  }

  async execute(): Promise<Career[]> {
    return await this.catalogRepo.getAllCareers();
  }
}
