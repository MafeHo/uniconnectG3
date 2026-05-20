import { IGroupMessageRepository } from '../../domain/repositories';
import chatSubject from '../observer/ChatSubject';
import { ChatEvents } from '../../domain/observer/ISubject';

export class PollScheduler {
  private static instance: PollScheduler | null = null;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private groupMessageRepo!: IGroupMessageRepository;

  private constructor() {}

  public static getInstance(): PollScheduler {
    if (!PollScheduler.instance) {
      PollScheduler.instance = new PollScheduler();
    }
    return PollScheduler.instance;
  }

  public init(groupMessageRepo: IGroupMessageRepository): void {
    this.groupMessageRepo = groupMessageRepo;
    console.log('[PollScheduler] Inicializado correctamente.');
  }

  public schedule(groupId: string, messageId: string, closesAt: Date): void {
    const key = `${groupId}::${messageId}`;
    
    // Si ya existe un timer activo para este mensaje, cancelarlo
    if (this.timers.has(key)) {
      this.cancel(groupId, messageId);
    }

    const delay = closesAt.getTime() - Date.now();
    console.log(`[PollScheduler] Programando cierre para ${key} en ${delay}ms (Fecha: ${closesAt.toISOString()})`);

    if (delay <= 0) {
      // Si el tiempo de expiración ya pasó o es inmediato, cerrar ahora mismo
      this.closePoll(groupId, messageId).catch(err => {
        console.error(`[PollScheduler] Error al cerrar encuesta expirada de inmediato:`, err);
      });
    } else {
      const timer = setTimeout(() => {
        this.closePoll(groupId, messageId).catch(err => {
          console.error(`[PollScheduler] Error al cerrar encuesta programada:`, err);
        });
      }, delay);
      this.timers.set(key, timer);
    }
  }

  public cancel(groupId: string, messageId: string): void {
    const key = `${groupId}::${messageId}`;
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
      console.log(`[PollScheduler] Timer cancelado para ${key}`);
    }
  }

  private async closePoll(groupId: string, messageId: string): Promise<void> {
    const key = `${groupId}::${messageId}`;
    
    try {
      if (!this.groupMessageRepo) {
        console.error('[PollScheduler] ERROR: groupMessageRepo no inicializado.');
        return;
      }

      const msg = await this.groupMessageRepo.getById(groupId, messageId);
      if (!msg) {
        console.warn(`[PollScheduler] Encuesta ${key} no encontrada para cerrar.`);
        this.timers.delete(key);
        return;
      }

      const metadata = (msg.metadata || {}) as Record<string, any>;
      const encuesta = metadata.encuesta || msg.encuesta;

      if (!encuesta) {
        console.warn(`[PollScheduler] Mensaje ${key} no es una encuesta.`);
        this.timers.delete(key);
        return;
      }

      // Si ya está cerrada, no hacer nada (idempotencia)
      if (encuesta.isClosed) {
        this.timers.delete(key);
        return;
      }

      // Marcar como cerrada
      encuesta.isClosed = true;

      // Calcular resultados finales con porcentajes
      const votes = (encuesta.votes || {}) as Record<string, string[]>;
      const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
      const finalResults = encuesta.options.map((optionText: string, idx: number) => {
        const optVotes = (votes[String(idx)] || []).length;
        return {
          text: optionText,
          votes: optVotes,
          percentage: totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0,
          voters: votes[String(idx)] || []
        };
      });

      metadata.encuesta = encuesta;

      // Persistir el cierre
      await this.groupMessageRepo.update(groupId, messageId, {
        metadata: metadata
      });

      console.log(`[PollScheduler] Encuesta ${key} cerrada con éxito.`);

      // Notificar Observer
      chatSubject.notify(ChatEvents.ENCUESTA_CERRADA, {
        groupId,
        messageId,
        finalResults,
        totalVotes
      });

    } catch (error) {
      console.error(`[PollScheduler] Error ejecutando closePoll para ${key}:`, error);
    } finally {
      this.timers.delete(key);
    }
  }

  public async restoreActivePolls(groupMessageRepo: IGroupMessageRepository): Promise<void> {
    try {
      console.log('[PollScheduler] Buscando encuestas activas para restaurar timers...');
      const activePolls = await groupMessageRepo.findActivePolls();
      
      console.log(`[PollScheduler] Encontradas ${activePolls.length} encuestas activas.`);
      for (const poll of activePolls) {
        const groupId = poll.groupId;
        const messageId = poll.id as string;
        const metadata = (poll.metadata || {}) as Record<string, any>;
        const encuesta = metadata.encuesta || poll.encuesta;

        if (groupId && messageId && encuesta && encuesta.closesAt) {
          const closesAt = new Date(encuesta.closesAt);
          this.schedule(groupId, messageId, closesAt);
        }
      }
      console.log(`[PollScheduler] ${activePolls.length} encuestas activas restauradas.`);
    } catch (err) {
      console.error('[PollScheduler] Error restaurando encuestas activas:', err);
    }
  }
}
