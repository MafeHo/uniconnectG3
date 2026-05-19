export abstract class IObserver {
  abstract update(event: string, data: Record<string, unknown>): Promise<void> | void;
}
