import type { User } from '@uniconnect/shared';

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByIds(userIds: string[]): Promise<Array<Partial<User> & { id: string; exists: boolean }>>;
  save(userId: string, userData: Partial<User>): Promise<void>;
  findAll(): Promise<User[]>;
  findByUids(uids: string[]): Promise<User[]>;
}
