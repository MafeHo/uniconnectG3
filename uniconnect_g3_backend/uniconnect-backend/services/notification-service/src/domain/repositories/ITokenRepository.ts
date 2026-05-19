export interface ITokenRepository {
  getTokensByUserId(userId: string): Promise<string[]>;
  saveToken(userId: string, token: string): Promise<void>;
  removeToken(token: string): Promise<void>;
}
