import { IMessageRepository } from '../../domain/repositories';

export interface ISocketService {
  emitToChat?(chatId: string, event: string, data: unknown): void;
  emitToGroup?(groupId: string, event: string, data: unknown): void;
}

export class AddReaction {
    private messageRepo: IMessageRepository;
    private socketService: ISocketService | null;

    constructor(messageRepo: IMessageRepository, socketService?: ISocketService) {
        this.messageRepo = messageRepo;
        this.socketService = socketService || null;
    }

    async execute(chatId: string, messageId: string, emoji: string, userId: string): Promise<Record<string, unknown>> {
        const message = await this.messageRepo.getById(chatId, messageId);
        if (!message) throw new Error('MESSAGE_NOT_FOUND');

        const reactions = (message.reacciones || {}) as Record<string, { count: number; users: string[] }>;

        if (!reactions[emoji]) {
            reactions[emoji] = { count: 0, users: [] };
        }

        const userIndex = reactions[emoji].users.indexOf(userId);
        if (userIndex === -1) {
            reactions[emoji].count += 1;
            reactions[emoji].users.push(userId);
        } else {
            reactions[emoji].count -= 1;
            reactions[emoji].users.splice(userIndex, 1);
            if (reactions[emoji].count <= 0) {
                delete reactions[emoji];
            }
        }

        await this.messageRepo.update(chatId, messageId, { reacciones: reactions });

        if (this.socketService && this.socketService.emitToChat) {
            this.socketService.emitToChat(chatId, 'message_updated', {
                messageId,
                reacciones: reactions
            });
        }

        return reactions;
    }
}
