import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';
import { IGroupMemberRepository } from '../../domain/repositories';

export class ValidarPermisosHandler extends BaseHandler {
  private groupMemberRepo: IGroupMemberRepository;

  constructor(groupMemberRepo: IGroupMemberRepository) {
    super();
    this.groupMemberRepo = groupMemberRepo;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { groupId, senderId } = request;

    if (!groupId || !senderId) {
      return this.retornarError('Faltan identificadores de grupo o remitente.', 'MISSING_IDS');
    }

    try {
      const isMember = await this.groupMemberRepo.isMember(groupId, senderId);
      if (!isMember) {
        return this.retornarError(
          'No tienes permiso para enviar mensajes en este grupo.',
          'FORBIDDEN_MEMBER'
        );
      }
    } catch (error) {
      console.error('[ValidarPermisosHandler] Error verificando membresía:', error);
      return this.retornarError('Error al verificar permisos del usuario.', 'INTERNAL_ERROR');
    }

    return await super.manejar(request);
  }
}
