import { IGroupRepository } from '../../../domain/repositories';

export class CheckGroupNameUnique {
  private groupRepo: IGroupRepository;

  constructor(groupRepo: IGroupRepository) {
    this.groupRepo = groupRepo;
  }

  async execute(name: string): Promise<boolean> {
    const existing = await this.groupRepo.findByName(name);
    return !existing;
  }
}
export default CheckGroupNameUnique;
