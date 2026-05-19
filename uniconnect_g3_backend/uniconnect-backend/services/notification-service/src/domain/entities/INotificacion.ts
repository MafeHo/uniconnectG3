export interface INotificacionDTO {
  userId: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  type: string;
  status: string;
  priority: string;
  priorityWeight: number;
  createdAt: Date;
  action?: {
    label: string;
    endpoint: string;
    token?: string | null;
  };
}

export abstract class INotificacion {
  abstract getDTO(): INotificacionDTO;
}
