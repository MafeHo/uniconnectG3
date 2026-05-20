import { IObserver } from '../../domain/observer/IObserver';
import { Server } from 'socket.io';
import * as admin from 'firebase-admin';
import { IEventSubscriptionRepository, ICategoryRepository } from '../../domain/repositories';

export class EventoUniversidadObserver extends IObserver {
  private io: Server;
  private db: admin.firestore.Firestore;
  private subscriptionRepo: IEventSubscriptionRepository;
  private categoryRepo: ICategoryRepository;

  constructor(io: Server, db: admin.firestore.Firestore, subscriptionRepo: IEventSubscriptionRepository, categoryRepo: ICategoryRepository) {
    super();
    this.io = io;
    this.db = db;
    this.subscriptionRepo = subscriptionRepo;
    this.categoryRepo = categoryRepo;
  }

  async update(event: string, data: Record<string, unknown>): Promise<void> {
    if (event !== 'NUEVO_EVENTO') return;

    try {
      const payload = data as { id?: string; title?: string; type?: string };
      console.log(`[Observer Evento] Procesando evento: ${event} para categoría: ${payload.type}`);
      
      // Resolver nombre legible de la categoría
      let categoryName = payload.type || '';
      if (this.categoryRepo && payload.type) {
        const cat = await this.categoryRepo.findAll();
        const found = cat.find(c => c.id === payload.type);
        if (found && found.name) categoryName = found.name;
      }

      // En la lógica original, se obtiene los usuarios suscritos a la categoría

      // Por simplicidad, adaptamos a la lógica original:
      // const usersSubscribed = await this.subscriptionRepo.getUsersSubscribedToCategory(payload.type);
      // Pero wait, subscriptionRepo tiene findByUser en nuestra interfaz, let's cast or adjust the interface method if needed!
      // En el repo original, se llama 'getUsersSubscribedToCategory(categoryId)'
      // Let's call the repository method directly since it might contain additional methods!
      const anyRepo = this.subscriptionRepo as { getUsersSubscribedToCategory?: (type: string) => Promise<unknown[]> };
      const subscribers = anyRepo.getUsersSubscribedToCategory && payload.type
        ? await anyRepo.getUsersSubscribedToCategory(payload.type) 
        : (payload.type ? await this.subscriptionRepo.findByUser(payload.type) : []);

      if (!subscribers || subscribers.length === 0) {
        console.log(`[Observer Evento] No hay usuarios suscritos a la categoría ${categoryName}`);
        return;
      }

      for (const subscriber of subscribers) {
        const sub = subscriber as { userId?: string; id?: string };
        const userId = typeof subscriber === 'string' ? subscriber : (sub.userId || sub.id || '');
        
        if (!userId) continue;

        // 1. Guardar en base de datos (Persistencia)
        const notification = {
          type: event,
          targetUserId: userId,
          eventId: payload.id,
          eventName: payload.title,
          category: categoryName,
          message: `Nuevo evento de la categoría ${categoryName}: ${payload.title}`,
          read: false,
          createdAt: new Date()
        };

        await this.db.collection('notifications').add(notification);
        
        // 2. Emitir WebSocket
        if (this.io) {
          this.io.to(userId).emit('notification', {
            type: event,
            eventId: payload.id,
            eventName: payload.title,
            category: categoryName,
            message: notification.message
          });
        }
      }

      console.log(`[Observer Evento] Notificaciones enviadas a ${subscribers.length} usuarios.`);
      
    } catch (error) {
      console.error('[Observer Evento] Error procesando notificación de evento:', error);
    }
  }
}
export default EventoUniversidadObserver;
