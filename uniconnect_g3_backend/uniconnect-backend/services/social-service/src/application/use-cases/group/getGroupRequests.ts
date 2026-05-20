import { IGroupRequestRepository } from '../../../domain/repositories';

export class GetGroupRequests {
  private groupRequestRepo: IGroupRequestRepository;

  constructor(groupRequestRepo: IGroupRequestRepository) {
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId: string): Promise<any[]> {
    return await this.groupRequestRepo.findPendingByGroupId(groupId);
  }
}
export default GetGroupRequests;
