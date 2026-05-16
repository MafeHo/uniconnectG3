class IMembershipState {
  constructor(subject) {
    this.subject = subject;
  }
  getFriendlyName() {
    switch (this.constructor.name) {
      case 'SolicitudIngresoState': return 'Pendiente de Ingreso';
      case 'MiembroAceptadoState': return 'Activo';
      case 'TransferenciaAdminSolicitadaState': return 'Transferencia Pendiente';
      case 'MiembroRechazadoState': return 'Rechazado';
      case 'TransferenciaAdminAceptadaState': return 'Transferencia Aceptada';
      default: return 'Desconocido';
    }
  }

  isExitLocked(context, currentUserId) {
    return false;
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
