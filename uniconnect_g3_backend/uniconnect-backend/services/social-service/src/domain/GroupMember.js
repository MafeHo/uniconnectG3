class GroupMember {
  constructor({ groupId, userId, role, joinedAt, state }) {
    this.groupId = groupId;
    this.userId = userId;
    this.role = role || 'student';
    this.joinedAt = joinedAt || new Date();
    this.state = state || null;
  }

  setState(newState) {
    this.state = newState;
  }

  async aceptarSolicitud() {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.aceptarSolicitud(this);
  }

  async rechazarSolicitud() {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.rechazarSolicitud(this);
  }

  async solicitarTransferencia() {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.solicitarTransferencia(this);
  }

  async aceptarTransferencia() {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.aceptarTransferencia(this);
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = GroupMember;
