import { IEventSubscriptionRepository } from '../../../domain/repositories';

export class GetSubscribedCategories {
  private subscriptionRepo: IEventSubscriptionRepository;

  constructor(subscriptionRepo: IEventSubscriptionRepository) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId: string): Promise<any[]> {
    const anyRepo = this.subscriptionRepo as any;
    return anyRepo.getSubscriptionsByUser 
      ? await anyRepo.getSubscriptionsByUser(userId)
      : await this.subscriptionRepo.findByUser(userId);
  }
}
export default GetSubscribedCategories;
