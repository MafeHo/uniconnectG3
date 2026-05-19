import { IEventSubscriptionRepository } from '../../../domain/repositories';

export class UnsubscribeFromCategory {
  private subscriptionRepo: IEventSubscriptionRepository;

  constructor(subscriptionRepo: IEventSubscriptionRepository) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId: string, categoryId: string): Promise<void> {
    await this.subscriptionRepo.unsubscribe(userId, categoryId);
  }
}
export default UnsubscribeFromCategory;
