import { ICategoryRepository } from '../../../domain/repositories';

export class GetCategories {
  private categoryRepo: ICategoryRepository;

  constructor(categoryRepo: ICategoryRepository) {
    this.categoryRepo = categoryRepo;
  }

  async execute(): Promise<any[]> {
    return await this.categoryRepo.findAll();
  }
}
export default GetCategories;
