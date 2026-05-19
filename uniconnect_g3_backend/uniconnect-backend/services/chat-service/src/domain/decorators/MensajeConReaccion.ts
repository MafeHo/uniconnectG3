import { IMensaje } from '../IMensaje';
import { MensajeDecorator } from './MensajeDecorator';

export interface ReaccionData {
  count: number;
  users: string[];
}

export class MensajeConReaccion extends MensajeDecorator {
  public reacciones: Map<string, ReaccionData>;

  constructor(mensaje: IMensaje) {
    super(mensaje);
    this.reacciones = new Map<string, ReaccionData>();
  }

  addReaccion(emoji: string, userId: string): void {
    if (!this.reacciones.has(emoji)) {
      this.reacciones.set(emoji, { count: 0, users: [] });
    }
    const data = this.reacciones.get(emoji)!;
    if (!data.users.includes(userId)) {
      data.users.push(userId);
      data.count = data.users.length;
    }
  }

  getMetadata(): Record<string, unknown> {
    const metadata = super.getMetadata();
    // Convertir el Map a un objeto plano para la metadata
    const reaccionesObj: Record<string, ReaccionData> = {};
    this.reacciones.forEach((value, key) => {
      reaccionesObj[key] = value;
    });
    
    return {
      ...metadata,
      reacciones: reaccionesObj
    };
  }
}
