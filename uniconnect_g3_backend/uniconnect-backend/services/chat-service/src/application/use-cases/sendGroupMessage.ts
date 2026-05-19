import { IMensaje } from '../../domain/IMensaje';
import { GroupMessage } from '../../domain/GroupMessage';
import { MensajeConArchivo } from '../../domain/decorators/MensajeConArchivo';
import { MensajeConMencion } from '../../domain/decorators/MensajeConMencion';
import { ValidationChainFactory } from '../factories/ValidationChainFactory';
import chatSubject from '../observer/ChatSubject';
import { ChatEvents } from '../../domain/observer/ISubject';
import { IGroupMessageRepository, IGroupMemberRepository } from '../../domain/repositories';
import { CloudinaryService } from '../../infrastructure/external/CloudinaryService';
import { BaseHandler, ValidationRequest, MulterFile } from '../validations/BaseHandler';

export interface SendGroupMessageData {
  text?: string;
  type?: string;
  fileUrl?: string;
  fileName?: string;
  [key: string]: unknown;
}

export class SendGroupMessage {
  private groupMessageRepo: IGroupMessageRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private cloudinaryService: CloudinaryService | null;
  private validationChain: BaseHandler;

  constructor(
    groupMessageRepo: IGroupMessageRepository,
    groupMemberRepo: IGroupMemberRepository,
    cloudinaryService: CloudinaryService | null = null
  ) {
    this.groupMessageRepo = groupMessageRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.cloudinaryService = cloudinaryService;
    this.validationChain = ValidationChainFactory.createGroupMessageChain(this.groupMemberRepo);
  }

  async execute(
    groupId: string,
    senderId: string,
    messageData: SendGroupMessageData,
    file: MulterFile | null = null
  ): Promise<Record<string, unknown>> {
    let fileUrl = (messageData.fileUrl as string) || '';
    let fileName = (messageData.fileName as string) || '';
    let type = (messageData.type as string) || 'text';
    let mimeType: string | null = null;
    let tamano = 0;

    if (file && this.cloudinaryService) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        fileUrl = uploadResult.fileUrl;
        fileName = file.originalname;
        type = 'file';
        mimeType = file.mimetype;
        tamano = file.size;
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error('No se pudo subir el archivo para el chat grupal');
      }
    }

    let message: IMensaje = new GroupMessage({
      senderId,
      type,
      text: messageData.text || '',
      fileUrl,
      fileName
    });

    if (type === 'file' && fileUrl) {
      message = new MensajeConArchivo(message, {
        url: fileUrl,
        mimeType: mimeType || 'application/octet-stream',
        tamano: tamano || 0,
        fileName: fileName
      });
    }

    const textStr = messageData.text || '';
    const mentionRegex = /@(\w+)/g;
    const matches = [...textStr.matchAll(mentionRegex)];
    const rawMentions = matches.map(m => m[1]);
    if (rawMentions.length > 0) {
      message = new MensajeConMencion(message, rawMentions);
    }

    const validationRequest: ValidationRequest = {
      groupId,
      senderId,
      text: messageData.text,
      file,
      mensajeDecorado: message
    };

    let validationResult;
    try {
      validationResult = await this.validationChain.manejar(validationRequest);
      
      if (!validationResult.hasOwnProperty('mensaje')) {
        validationResult.mensaje = message;
      }
    } catch (e) {
      console.error('[SendGroupMessage] Excepción inesperada en la cadena de validación:', e);
      throw new Error('Ocurrió un error interno durante la validación del mensaje');
    }

    if (!validationResult.esValido) {
      const error = new Error(validationResult.error || 'Validation error') as Error & { codigo?: string };
      error.codigo = validationResult.codigo;
      throw error;
    }

    const validMessage = validationResult.mensaje!;
    const messageJson = (validMessage as unknown as { toJSON: () => Record<string, unknown> }).toJSON();

    if (validationRequest.renderedText) {
      messageJson.renderedContent = validationRequest.renderedText;
    }
    if (validationRequest.mentions && validationRequest.mentions.length > 0) {
      messageJson.metadata = (messageJson.metadata as Record<string, unknown>) || {};
      (messageJson.metadata as Record<string, unknown>).menciones = validationRequest.mentions;
    }

    const messageId = await this.groupMessageRepo.create(groupId, messageJson);

    const msgAny = messageJson as Record<string, unknown> & { content?: string; text?: string; renderedContent?: string; metadata?: unknown };
    const result = {
      messageId,
      ...msgAny
    };

    chatSubject.notify(ChatEvents.NUEVO_MENSAJE, {
      groupId,
      message: {
        message_id: messageId,
        timestamp: new Date().toISOString(),
        sender: { id: senderId },
        content: msgAny.content || msgAny.text || '',
        renderedContent: msgAny.renderedContent,
        metadata: msgAny.metadata
      }
    });

    return result;
  }
}
