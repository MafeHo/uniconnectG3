import { IEventSubscriptionRepository } from '../../../domain/repositories';

export class SubscribeToCategory {
  private subscriptionRepo: IEventSubscriptionRepository;

  constructor(subscriptionRepo: IEventSubscriptionRepository) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId: string, categoryId: string): Promise<void> {
    const anyRepo = this.subscriptionRepo as { getSubscriptionsByUser?: (userId: string) => Promise<string[]> };
    const current = anyRepo.getSubscriptionsByUser 
      ? await anyRepo.getSubscriptionsByUser(userId)
      : (await this.subscriptionRepo.findByUser(userId)).map(sub => sub.categoryId);
      
    if (current.includes(categoryId)) {
      const err = new Error('El estudiante ya está suscrito a esta categoría') as Error & { code?: string };
      err.code = 'ALREADY_SUBSCRIBED';
      throw err;
    }
    await this.subscriptionRepo.subscribe(userId, categoryId);
  }
}
export default SubscribeToCategory;
