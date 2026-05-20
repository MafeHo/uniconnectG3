export interface INotificationProvider {
  sendPush(token: string, title: string, body: string, data?: Record<string, unknown>): Promise<unknown>;
  sendPushToMultiple(tokens: string[], title: string, body: string, data?: Record<string, unknown>): Promise<unknown>;
}
