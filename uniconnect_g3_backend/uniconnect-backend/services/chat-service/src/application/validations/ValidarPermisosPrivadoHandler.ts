import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';
import { IChatRepository } from '../../domain/repositories';

export class ValidarPermisosPrivadoHandler extends BaseHandler {
  private chatRepo: IChatRepository;

  constructor(chatRepo: IChatRepository) {
    super();
    this.chatRepo = chatRepo;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { chatId, senderId } = request;

    if (!chatId || !senderId) {
      return this.retornarError('Faltan identificadores de chat o remitente.', 'MISSING_IDS');
    }

    try {
      const chat = await this.chatRepo.findById(chatId);
      if (!chat) {
        return await super.manejar(request);
      }

      if (chat.participants && !(chat.participants as string[]).includes(senderId)) {
        return this.retornarError(
          'No tienes permiso para enviar mensajes en este chat privado.',
          'FORBIDDEN_MEMBER'
        );
      }
    } catch (error) {
      console.error('[ValidarPermisosPrivadoHandler] Error verificando membresía:', error);
      return this.retornarError('Error al verificar permisos del usuario.', 'INTERNAL_ERROR');
    }

    return await super.manejar(request);
  }
}
