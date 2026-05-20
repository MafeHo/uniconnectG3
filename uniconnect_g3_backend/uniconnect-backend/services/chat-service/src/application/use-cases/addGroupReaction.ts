import { IGroupMessageRepository } from '../../domain/repositories';
import { ISocketService } from './addReaction';

export class AddGroupReaction {
    private groupMessageRepo: IGroupMessageRepository;
    private socketService: ISocketService | null;

    constructor(groupMessageRepo: IGroupMessageRepository, socketService?: ISocketService) {
        this.groupMessageRepo = groupMessageRepo;
        this.socketService = socketService || null;
    }

    async execute(groupId: string, messageId: string, emoji: string, userId: string): Promise<Record<string, unknown>> {
        const message = await this.groupMessageRepo.getById(groupId, messageId);
        if (!message) throw new Error('GROUP_MESSAGE_NOT_FOUND');

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

        await this.groupMessageRepo.update(groupId, messageId, { reacciones: reactions });

        if (this.socketService && this.socketService.emitToGroup) {
            this.socketService.emitToGroup(groupId, 'message_updated', {
                messageId,
                reacciones: reactions
            });
        }

        return reactions;
    }
}
