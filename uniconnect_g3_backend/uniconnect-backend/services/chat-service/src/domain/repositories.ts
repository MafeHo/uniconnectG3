export interface User {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  [key: string]: unknown;
}

export interface IChatRepository {
  findById(chatId: string): Promise<Record<string, unknown> | null>;
  create(chatId: string, chatData: { participants: string[]; lastMessage?: string }): Promise<void>;
  updateLastMessage(chatId: string, text: string): Promise<void>;
  findByUserId(userId: string): Promise<Record<string, unknown>[]>;
}

export interface IGroupMemberRepository {
  getGroupMembersWithNames(groupId: string): Promise<User[]>;
  isMember(groupId: string, userId: string): Promise<boolean>;
  getGroupsByUserId(userId: string): Promise<string[]>;
}

export interface IGroupMessageRepository {
  create(groupId: string, messageData: Record<string, unknown>): Promise<string>;
  findWithPagination(groupId: string, limitCount?: number, lastMessageId?: string | null): Promise<Record<string, unknown>[]>;
  getMessagesSince(groupId: string, timestamp: number | string | Date): Promise<Record<string, unknown>[]>;
  getById(groupId: string, messageId: string): Promise<Record<string, unknown> | null>;
  update(groupId: string, messageId: string, data: Record<string, unknown>): Promise<void>;
}

export interface IMessageRepository {
  findByChatId(chatId: string): Promise<Record<string, unknown>[]>;
  findWithPagination(chatId: string, limitCount?: number, lastMessageId?: string | null): Promise<Record<string, unknown>[]>;
  getMessagesSince(chatId: string, timestamp: number | string | Date): Promise<Record<string, unknown>[]>;
  create(chatId: string, messageData: Record<string, unknown>): Promise<void>;
  getById(chatId: string, messageId: string): Promise<Record<string, unknown> | null>;
  update(chatId: string, messageId: string, data: Record<string, unknown>): Promise<void>;
}
