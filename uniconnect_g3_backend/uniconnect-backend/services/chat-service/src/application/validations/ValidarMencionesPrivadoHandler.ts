import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';
import { IChatRepository } from '../../domain/repositories';

export class ValidarMencionesPrivadoHandler extends BaseHandler {
  private chatRepo: IChatRepository;

  constructor(chatRepo: IChatRepository) {
    super();
    this.chatRepo = chatRepo;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { text, chatId } = request;

    if (!text) {
      request.mentions = [];
      return await super.manejar(request);
    }

    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) {
      request.mentions = [];
      return await super.manejar(request);
    }

    try {
      if (chatId) {
        const chat = await this.chatRepo.findById(chatId);
        const mentionedUserIds: string[] = [];
        let renderedText = text;

        for (const match of matches) {
          renderedText = renderedText.replace(match[0], `<span class="mention">${match[0]}</span>`);
        }

        if (chat && chat.participants) {
          const participants = chat.participants as string[];
          for (const participantId of participants) {
            if (participantId !== request.senderId) {
               if (matches.length > 0) {
                 mentionedUserIds.push(participantId);
               }
            }
          }
        }

        request.mentions = mentionedUserIds;
        request.renderedText = renderedText;
      } else {
        request.mentions = [];
        request.renderedText = text;
      }
    } catch (error) {
      console.error('[ValidarMencionesPrivadoHandler] Error detectando menciones:', error);
      request.mentions = [];
      request.renderedText = text;
    }

    return await super.manejar(request);
  }
}
