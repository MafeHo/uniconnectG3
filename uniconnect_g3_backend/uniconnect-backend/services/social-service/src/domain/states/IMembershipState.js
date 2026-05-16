class IMembershipState {
  constructor(subject) {
    this.subject = subject;
  }

  async aceptarSolicitud(context) {
    throw new Error(`[State Error] Action "aceptarSolicitud" is not allowed in state ${this.constructor.name}`);
  }

  async rechazarSolicitud(context) {
    throw new Error(`[State Error] Action "rechazarSolicitud" is not allowed in state ${this.constructor.name}`);
  }

  async solicitarTransferencia(context) {
    throw new Error(`[State Error] Action "solicitarTransferencia" is not allowed in state ${this.constructor.name}`);
  }

  async aceptarTransferencia(context) {
    throw new Error(`[State Error] Action "aceptarTransferencia" is not allowed in state ${this.constructor.name}`);
  }
}

module.exports = IMembershipState;
