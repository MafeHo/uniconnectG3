const GroupMember = require('../../../domain/GroupMember');
const SolicitudIngresoState = require('../../../domain/states/SolicitudIngresoState');

class HandleRequestAction {
  constructor(groupMemberRepo, groupRequestRepo, groupRepo, subject) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.groupRepo = groupRepo;
    this.subject = subject;
  }

  async execute(groupId, requestId, status) {
    // 1. Reconstruir la entidad de contexto con su estado inicial
    const member = new GroupMember({
      groupId,
      userId: requestId,
      state: new SolicitudIngresoState(this.subject)
    });

    // 2. Ejecutar la acción en el dominio (sin if/else lógicos de negocio)
    if (status === 'accepted') {
      await member.aceptarSolicitud();
    } else {
      await member.rechazarSolicitud();
    }

    // 3. Persistencia y Consistencia basada en el estado final del objeto
    const finalState = member.state.constructor.name;

    if (finalState === 'MiembroAceptadoState') {
      await this.groupMemberRepo.add({
        groupId,
        userId: requestId,
        role: 'student',
        joinedAt: new Date()
      });
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'accepted');
    } else if (finalState === 'MiembroRechazadoState') {
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'rejected');
    }

    return { message: `Solicitud procesada. Estado actual: ${finalState}` };
  }
}

module.exports = HandleRequestAction;
