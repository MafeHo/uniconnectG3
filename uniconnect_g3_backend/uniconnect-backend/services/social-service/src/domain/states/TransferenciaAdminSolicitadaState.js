const IMembershipState = require('./IMembershipState');

class TransferenciaAdminSolicitadaState extends IMembershipState {
  constructor(subject) {
    super(subject);
  }

  async aceptarTransferencia(context) {
    const TransferenciaAdminAceptadaState = require('./TransferenciaAdminAceptadaState');
    context.setState(new TransferenciaAdminAceptadaState(this.subject));

    if (this.subject) {
      this.subject.notify('ADMIN_TRANSFER_COMPLETED', {
        userId: context.userId,
        groupId: context.groupId
      });
    }
    return true;
  }
}

module.exports = TransferenciaAdminSolicitadaState;
