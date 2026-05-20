import { IMessageRepository } from '../../domain/repositories';

export class GetMessages {
  private messageRepo: IMessageRepository;

  constructor(messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(chatId: string): Promise<Record<string, unknown>[]> {
    return await this.messageRepo.findByChatId(chatId);
  }
}
