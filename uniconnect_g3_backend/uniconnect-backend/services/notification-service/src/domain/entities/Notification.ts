import * as admin from 'firebase-admin';
import { INotificacion, INotificacionDTO } from './INotificacion';

interface NotificationParams {
  id?: string;
  userId: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  type: string;
  status?: string;
  priority?: string;
  createdAt?: Date | string;
}

export class Notification extends INotificacion {
  public id?: string;
  public userId: string;
  public title: string;
  public body: string;
  public metadata: Record<string, unknown>;
  public type: string;
  public status: string;
  public priority: string;
  public createdAt: Date;

  constructor(params: NotificationParams) {
    super();
    this.id = params.id;
    this.userId = params.userId;
    this.title = params.title;
    this.body = params.body;
    this.metadata = params.metadata || {};
    this.type = params.type;
    this.status = params.status || 'unread';
    this.priority = params.priority || 'normal';
    
    if (params.createdAt instanceof Date) {
      this.createdAt = params.createdAt;
    } else if (typeof params.createdAt === 'string') {
      this.createdAt = new Date(params.createdAt);
    } else {
      this.createdAt = new Date();
    }
  }

  static fromFirestore(id: string, data: admin.firestore.DocumentData): Notification {
    return new Notification({
      id,
      userId: data.userId,
      title: data.title,
      body: data.body,
      metadata: data.metadata,
      type: data.type,
      status: data.status,
      priority: data.priority,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
    });
  }

  getDTO(): INotificacionDTO {
    const safePriority = this.priority || 'normal';
    const weightMap: Record<string, number> = { critica: 3, urgente: 2, normal: 1 };

    return {
      userId: this.userId,
      title: this.title,
      body: this.body,
      metadata: this.metadata,
      type: this.type,
      status: this.status,
      priority: safePriority,
      priorityWeight: weightMap[safePriority] || 1,
      createdAt: this.createdAt
    };
  }

  toFirestore(): INotificacionDTO {
    return this.getDTO();
  }
}
