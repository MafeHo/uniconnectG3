import { INotificacionDTO } from '../../domain/entities/INotificacion';

export interface INotificationWithId extends INotificacionDTO {
  id: string;
}

export interface INotificationRepository {
  findById(id: string): Promise<INotificationWithId | null>;
  markAsRead(id: string): Promise<void>;
  findByUserId(userId: string, limit: number): Promise<INotificationWithId[]>;
  countUnread(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
  save(notification: INotificacionDTO): Promise<string>;
}

export class MarkNotificationAsRead {
  private notificationRepo: INotificationRepository;

  constructor(notificationRepo: INotificationRepository) {
    this.notificationRepo = notificationRepo;
  }

  async execute(notificationId: string, authUserId: string): Promise<boolean> {
    if (!notificationId || !authUserId) {
      throw new Error('MISSING_FIELDS');
    }

    const notification = await this.notificationRepo.findById(notificationId);
    if (!notification) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== authUserId) {
      throw new Error('UNAUTHORIZED');
    }

    if (notification.status !== 'read') {
      await this.notificationRepo.markAsRead(notificationId);
    }
    
    return true;
  }
}
