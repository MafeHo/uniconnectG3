export interface IObserver {
  update(event: string, data: Record<string, unknown>): Promise<void> | void;
}
