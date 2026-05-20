import { IEstadoGrupo } from './IEstadoGrupo';
import { GroupMember } from '../GroupMember';

export class PendienteTransferencia extends IEstadoGrupo {
  isExitLocked(context: GroupMember, currentUserId: string): boolean {
    return currentUserId === context.requesterId;
  }

  async aceptar(context: GroupMember): Promise<boolean> {
    context.transitionTo('TransferenciaAceptada');

    if (this.subject) {
      this.subject.notify('ADMIN_TRANSFER_COMPLETED', {
        groupId: context.groupId,
        userId: context.userId,
        newState: context.state ? context.state.getFriendlyName() : 'Transferencia Aceptada'
      });
    }
    return true;
  }

  async rechazar(context: GroupMember): Promise<boolean> {
    // Retorno al estado inicial (Criterio 4)
    context.transitionTo('Activo');

    // Emisión de evento (Criterio 6)
    if (this.subject) {
      this.subject.notify('ADMIN_TRANSFER_REJECTED', {
        groupId: context.groupId,
        userId: context.userId,
        newState: context.state ? context.state.getFriendlyName() : 'Activo'
      });
    }
    return true;
  }
}
