import { IEstadoGrupo } from './IEstadoGrupo';
import { GroupMember } from '../GroupMember';

export class Activo extends IEstadoGrupo {
  async transferir(context: GroupMember): Promise<boolean> {
    // 1. Transición al estado PendienteTransferencia (Criterio 2)
    context.transitionTo('PendienteTransferencia');

    // 2. Emisión de eventos con el nuevo estado (Criterio 6)
    if (this.subject) {
      this.subject.notify('ADMIN_TRANSFER_REQUESTED', {
        groupId: context.groupId,
        oldAdminId: context.userId,
        candidateId: context.candidateId,
        userName: context.userName,
        newState: context.state ? context.state.getFriendlyName() : 'Transferencia Pendiente'
      });
    }
    return true;
  }

  async disolver(context: GroupMember): Promise<boolean> {
    context.transitionTo('Disuelto');
    if (this.subject) {
      this.subject.notify('GROUP_DISSOLVED', {
        groupId: context.groupId,
        newState: context.state ? context.state.getFriendlyName() : 'Disuelto'
      });
    }
    return true;
  }

  async bloquear(context: GroupMember): Promise<boolean> {
    context.transitionTo('Bloqueado');
    if (this.subject) {
      this.subject.notify('GROUP_LOCKED', {
        groupId: context.groupId,
        newState: context.state ? context.state.getFriendlyName() : 'Bloqueado'
      });
    }
    return true;
  }
}
