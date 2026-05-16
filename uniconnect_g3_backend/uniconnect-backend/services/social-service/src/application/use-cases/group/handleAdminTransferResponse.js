const GroupMember = require('../../../domain/GroupMember');
const TransferenciaAdminSolicitadaState = require('../../../domain/states/TransferenciaAdminSolicitadaState');

class HandleAdminTransferResponse {
  constructor(groupRepo, groupMemberRepo, userRepo, db, subject) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId, candidateId, action) {
    const group = await this.groupRepo.findById(groupId);
    const transfer = group ? group.pendingAdminTransfer : null;
    const requesterId = transfer ? transfer.requesterId : null;

    // 1. Reconstruir al candidato con el estado de transferencia pendiente
    const member = new GroupMember({
      groupId,
      userId: candidateId,
      state: new TransferenciaAdminSolicitadaState(this.subject)
    });

    if (action === 'accept') {
      // 2. Delegar la transición al estado (lanzará error si el estado no lo permite)
      await member.aceptarTransferencia();

      // 3. Persistencia: Solo se guarda si la transición al estado final fue exitosa
      if (member.state.constructor.name === 'TransferenciaAdminAceptadaState') {
        await this.db.runTransaction(async (transaction) => {
          const groupRef = this.db.collection('groups').doc(groupId);
          transaction.update(groupRef, { creatorId: candidateId, pendingAdminTransfer: null });

          const candidateMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, candidateId);
          if (candidateMember) transaction.update(candidateMember.ref, { role: 'admin' });

          if (requesterId) {
            const oldAdminMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, requesterId);
            if (oldAdminMember) transaction.delete(oldAdminMember.ref);
          }
        });

        return { success: true, message: 'Transferencia completada. Estado: TransferenciaAdminAceptadaState' };
      }
    } else if (action === 'reject') {
      // Simplemente limpiamos la base de datos para el rechazo
      await this.groupRepo.update(groupId, { pendingAdminTransfer: null });
      return { success: true, message: 'Solicitud de transferencia rechazada.' };
    }
  }
}

module.exports = HandleAdminTransferResponse;
