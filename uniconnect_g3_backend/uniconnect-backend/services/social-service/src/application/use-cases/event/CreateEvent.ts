import { IEventRepository } from '../../../domain/repositories';
import { ISubject } from '../../../domain/observer/ISubject';

export class CreateEvent {
  private eventRepo: IEventRepository;
  private eventSubject: ISubject;

  constructor(eventRepo: IEventRepository, eventSubject: ISubject) {
    this.eventRepo = eventRepo;
    this.eventSubject = eventSubject;
  }

  async execute(eventData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const createdEvent = await this.eventRepo.create(eventData);
    
    // Notificar a los observadores sobre el nuevo evento
    this.eventSubject.notify('NUEVO_EVENTO', createdEvent as unknown as Record<string, unknown>);
    
    return createdEvent as unknown as Record<string, unknown>;
  }
}
export default CreateEvent;
