import { GroupMember } from '../GroupMember';
import { ISubject } from '../observer/ISubject';

export abstract class IEstadoGrupo {
  public subject: ISubject | null;

  constructor(subject: ISubject | null) {
    this.subject = subject;
  }

  getFriendlyName(): string {
    const name = this.constructor.name;
    switch (name) {
      case 'Activo': return 'Activo';
      case 'PendienteTransferencia': return 'Transferencia Pendiente';
      case 'TransferenciaAceptada': return 'Transferencia Aceptada';
      case 'Disuelto': return 'Disuelto';
      case 'Bloqueado': return 'Bloqueado';
      default: return 'Desconocido';
    }
  }

  isExitLocked(_context: GroupMember, _currentUserId: string): boolean {
    return false;
  }

  async solicitar(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "solicitar" is not allowed in state ${this.constructor.name}`);
  }

  async aceptar(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "aceptar" is not allowed in state ${this.constructor.name}`);
  }

  async rechazar(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "rechazar" is not allowed in state ${this.constructor.name}`);
  }

  async transferir(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "transferir" is not allowed in state ${this.constructor.name}`);
  }

  async disolver(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "disolver" is not allowed in state ${this.constructor.name}`);
  }

  async bloquear(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "bloquear" is not allowed in state ${this.constructor.name}`);
  }

  async desbloquear(_context: GroupMember): Promise<any> {
    throw new Error(`[State Error] Action "desbloquear" is not allowed in state ${this.constructor.name}`);
  }
}
