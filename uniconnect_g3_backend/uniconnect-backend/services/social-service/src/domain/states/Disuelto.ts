import { IEstadoGrupo } from './IEstadoGrupo';
import { GroupMember } from '../GroupMember';

export class Disuelto extends IEstadoGrupo {
  getFriendlyName(): string {
    return 'Grupo Disuelto';
  }

  private _rejectAction(): void {
    throw new Error('ACTION_REJECTED: The group is dissolved and cannot perform actions');
  }

  async solicitar(_context: GroupMember): Promise<any> { this._rejectAction(); }
  
  async aceptar(_context: GroupMember): Promise<any> { 
    throw new Error('[Forbidden] No se puede operar en un grupo disuelto'); 
  }
  
  async rechazar(_context: GroupMember): Promise<any> { this._rejectAction(); }
  
  async transferir(_context: GroupMember): Promise<any> { 
    throw new Error('[Forbidden] No se puede operar en un grupo disuelto'); 
  }
  async disolver(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async bloquear(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async desbloquear(_context: GroupMember): Promise<any> { this._rejectAction(); }
}
