const IMembershipState = require('./IMembershipState');

class MiembroAceptadoState extends IMembershipState {
  constructor(subject) {
    super(subject);
  }

  async solicitarTransferencia(context) {
    const TransferenciaAdminSolicitadaState = require('./TransferenciaAdminSolicitadaState');
    context.setState(new TransferenciaAdminSolicitadaState(this.subject));

    if (this.subject) {
      this.subject.notify('ADMIN_TRANSFER_REQUESTED', {
        userId: context.userId,
        groupId: context.groupId
      });
    }
    return true;
  }
}

module.exports = MiembroAceptadoState;
