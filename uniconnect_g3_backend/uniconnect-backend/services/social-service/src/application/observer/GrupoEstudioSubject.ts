import { ISubject } from '../../domain/observer/ISubject';
import { IObserver } from '../../domain/observer/IObserver';

class GrupoEstudioSubject extends ISubject {
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

  notify(event: string, data: Record<string, unknown>): void {
    for (const observer of this.observers) {
      observer.update(event, data);
    }
  }
}

const studyGroupSubject = new GrupoEstudioSubject();
export default studyGroupSubject;
