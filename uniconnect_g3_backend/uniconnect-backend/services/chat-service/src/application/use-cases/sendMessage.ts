import { IMensaje } from '../../domain/IMensaje';
import { MensajeBase } from '../../domain/MensajeBase';
import { MensajeConArchivo } from '../../domain/decorators/MensajeConArchivo';
import { ValidationChainFactory } from '../factories/ValidationChainFactory';
import { IMessageRepository, IChatRepository } from '../../domain/repositories';
import { BaseHandler, ValidationRequest } from '../validations/BaseHandler';

export interface SendMessageData {
  text?: string;
  type?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  tamano?: number;
}

export class SendMessage {
  private messageRepo: IMessageRepository;
  private chatRepo: IChatRepository;
  private validationChain: BaseHandler;

  constructor(messageRepo: IMessageRepository, chatRepo: IChatRepository) {
    this.messageRepo = messageRepo;
    this.chatRepo = chatRepo;
    this.validationChain = ValidationChainFactory.createPrivateMessageChain(chatRepo);
  }

  async execute(chatId: string, senderId: string, messageData: string | SendMessageData): Promise<Record<string, unknown>> {
    const isObject = typeof messageData === 'object' && messageData !== null;
    const data = isObject ? (messageData as SendMessageData) : { text: messageData as string, type: 'text' };

    const validationRequest: ValidationRequest = { 
      chatId, 
      senderId, 
      text: data.text || ''
    };
    
    const validationResult = await this.validationChain.manejar(validationRequest);
    
    if (!validationResult.esValido) {
      const error = new Error(validationResult.error || 'Validation error') as Error & { codigo?: string };
      error.codigo = validationResult.codigo;
      throw error;
    }

    let message: IMensaje = new MensajeBase(data.text || '', { 
      senderId, 
      type: data.type || 'text' 
    });

    if (data.type === 'file' && data.fileUrl) {
      message = new MensajeConArchivo(message, {
        url: data.fileUrl,
        fileName: data.fileName || '',
        mimeType: data.mimeType || 'application/octet-stream',
        tamano: data.tamano || 0
      });
    }

    const payload = {
      senderId,
      type: data.type || 'text',
      text: message.getContenido(),
      renderedContent: validationRequest.renderedText || message.render(),
      metadata: {
        ...message.getMetadata(),
        mentions: validationRequest.mentions || []
      }
    };

    await this.messageRepo.create(chatId, payload);

    const summaryText = data.type === 'file'
      ? `📎 Archivo: ${data.fileName}`
      : data.text || '';

    await this.chatRepo.updateLastMessage(chatId, summaryText);

    return payload;
  }
}
