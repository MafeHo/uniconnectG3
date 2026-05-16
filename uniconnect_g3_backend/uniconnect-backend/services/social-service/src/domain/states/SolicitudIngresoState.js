const IMembershipState = require('./IMembershipState');

class SolicitudIngresoState extends IMembershipState {
  constructor(subject) {
    super(subject);
  }

  async aceptarSolicitud(context) {
    const MiembroAceptadoState = require('./MiembroAceptadoState');
    context.setState(new MiembroAceptadoState(this.subject));
    
    if (this.subject) {
      this.subject.notify('GROUP_MEMBER_ACCEPTED', {
        userId: context.userId,
        groupId: context.groupId
      });
    }
    return true;
  }

  async rechazarSolicitud(context) {
    const MiembroRechazadoState = require('./MiembroRechazadoState');
    context.setState(new MiembroRechazadoState(this.subject));
    
    if (this.subject) {
      this.subject.notify('GROUP_MEMBER_REJECTED', {
        userId: context.userId,
        groupId: context.groupId
      });
    }
    return true;
  }
}

module.exports = SolicitudIngresoState;
