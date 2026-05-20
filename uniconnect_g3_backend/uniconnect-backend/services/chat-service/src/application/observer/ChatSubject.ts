import { ISubject } from '../../domain/observer/ISubject';
import { IObserver } from '../../domain/observer/IObserver';

export class ChatSubject implements ISubject {
  private observers: IObserver[] = [];

  attach(observer: IObserver): void {
    const exists = this.observers.includes(observer);
    if (!exists) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  async notify(event: string, data: Record<string, unknown>): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.update(event, data);
      } catch (error: unknown) {
        console.error(`Error en el observer: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
}

const chatSubject = new ChatSubject();
export default chatSubject;
