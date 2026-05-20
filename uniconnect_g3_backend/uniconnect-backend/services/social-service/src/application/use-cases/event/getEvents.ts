import { IEventRepository, ICategoryRepository } from '../../../domain/repositories';

export class GetEvents {
  private eventRepo: IEventRepository;
  private categoryRepo: ICategoryRepository;

  constructor(eventRepo: IEventRepository, categoryRepo: ICategoryRepository) {
    this.eventRepo = eventRepo;
    this.categoryRepo = categoryRepo;
  }

  async execute({ categoryId }: { categoryId?: string | null } = {}): Promise<any[]> {
    const [events, categories] = await Promise.all([
      this.eventRepo.findAll(categoryId),
      this.categoryRepo.findAll()
    ]);
    
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    const mappedEvents = events.map(event => ({
      ...event,
      type: categoryMap[event.type] || 'General'
    }));

    return mappedEvents.sort((a, b) => a.type.localeCompare(b.type));
  }
}
export default GetEvents;
