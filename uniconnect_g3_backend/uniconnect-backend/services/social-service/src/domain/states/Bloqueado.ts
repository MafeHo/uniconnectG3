import { IEstadoGrupo } from './IEstadoGrupo';
import { GroupMember } from '../GroupMember';

export class Bloqueado extends IEstadoGrupo {
  getFriendlyName(): string {
    return 'Grupo Bloqueado';
  }

  private _rejectAction(): void {
    throw new Error('ACTION_REJECTED: The group is currently locked for administrative reasons');
  }

  async desbloquear(context: GroupMember): Promise<boolean> {
    context.transitionTo('Activo');
    if (this.subject) {
      this.subject.notify('GROUP_UNLOCKED', {
        groupId: context.groupId,
        newState: context.state ? context.state.getFriendlyName() : 'Activo'
      });
    }
    return true;
  }

  async solicitar(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async aceptar(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async rechazar(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async transferir(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async disolver(_context: GroupMember): Promise<any> { this._rejectAction(); }
  async bloquear(_context: GroupMember): Promise<any> { this._rejectAction(); }
}
