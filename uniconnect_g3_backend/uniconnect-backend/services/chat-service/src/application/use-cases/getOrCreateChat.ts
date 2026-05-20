import { IChatRepository } from '../../domain/repositories';

export class GetOrCreateChat {
  private chatRepo: IChatRepository;

  constructor(chatRepo: IChatRepository) {
    this.chatRepo = chatRepo;
  }

  async execute(userA: string, userB: string): Promise<string> {
    const chatId = [userA, userB].sort().join('_');
    const existing = await this.chatRepo.findById(chatId);

    if (!existing) {
      await this.chatRepo.create(chatId, {
        participants: [userA, userB],
        lastMessage: '',
      });
    }

    return chatId;
  }
}
