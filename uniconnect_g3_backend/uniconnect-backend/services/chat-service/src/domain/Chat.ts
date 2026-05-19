export interface ChatParams {
  id?: string;
  participants?: string[];
  lastMessage?: string;
  updatedAt?: Date;
}

export class Chat {
  public id?: string;
  public participants: string[];
  public lastMessage: string;
  public updatedAt: Date;

  constructor({ id, participants, lastMessage, updatedAt }: ChatParams) {
    this.id = id;
    this.participants = participants || [];
    this.lastMessage = lastMessage || '';
    this.updatedAt = updatedAt || new Date();
  }
}
