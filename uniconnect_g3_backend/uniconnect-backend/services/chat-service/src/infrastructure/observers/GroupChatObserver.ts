import { IObserver } from '../../domain/observer/IObserver';
import { ChatEvents } from '../../domain/observer/ISubject';
import { Server } from 'socket.io';

export class GroupChatObserver implements IObserver {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async update(event: string, data: Record<string, unknown>): Promise<void> {
    console.log(`[Observer Debug] Evento recibido: ${event}`);
    if (event === ChatEvents.NUEVO_MENSAJE) {
      const payload = data as unknown as { groupId: string; message: { message_id: string; [key: string]: unknown } };
      const { groupId, message } = payload;
      
      console.log(`[Observer Debug] Difundiendo mensaje ${message.message_id} en sala ${groupId}`);
      
      this.io.to(groupId).emit('new_message', message);
      console.log(`[Observer Debug] Emitido con éxito a la sala ${groupId}`);
    }
  }
}
