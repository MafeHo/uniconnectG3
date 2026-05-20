import { IMensaje } from '../../domain/IMensaje';
import { GroupMessage } from '../../domain/GroupMessage';
import { MensajeConEncuesta } from '../../domain/decorators/MensajeConEncuesta';
import { MensajeConMencion } from '../../domain/decorators/MensajeConMencion';
import { ValidationChainFactory } from '../factories/ValidationChainFactory';
import chatSubject from '../observer/ChatSubject';
import { ChatEvents } from '../../domain/observer/ISubject';
import { IGroupMessageRepository, IGroupMemberRepository } from '../../domain/repositories';
import { BaseHandler, ValidationRequest } from '../validations/BaseHandler';

// Definimos la interfaz del programador para evitar acoplamiento rígido o errores antes del paso 1.4
export interface IPollScheduler {
  schedule(groupId: string, messageId: string, closesAt: Date): void;
}

export interface CreatePollData {
  question: string;
  options: string[];
  duration: number; // en minutos
  text?: string;
}

export class CreatePoll {
  private groupMessageRepo: IGroupMessageRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private pollScheduler: IPollScheduler;
  private validationChain: BaseHandler;

  constructor(
    groupMessageRepo: IGroupMessageRepository,
    groupMemberRepo: IGroupMemberRepository,
    pollScheduler: IPollScheduler
  ) {
    this.groupMessageRepo = groupMessageRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.pollScheduler = pollScheduler;
    this.validationChain = ValidationChainFactory.createGroupMessageChain(this.groupMemberRepo);
  }

  async execute(
    groupId: string,
    senderId: string,
    pollData: CreatePollData
  ): Promise<Record<string, unknown>> {
    const textContent = pollData.text || pollData.question;

    let message: IMensaje = new GroupMessage({
      senderId,
      type: 'poll',
      text: textContent
    });

    // Decorar con MensajeConEncuesta
    message = new MensajeConEncuesta(message, {
      question: pollData.question,
      options: pollData.options,
      duration: pollData.duration,
      creatorId: senderId
    });

    // Decorar con MensajeConMencion si hay menciones en el texto
    const mentionRegex = /@(\w+)/g;
    const matches = [...textContent.matchAll(mentionRegex)];
    const rawMentions = matches.map(m => m[1]);
    if (rawMentions.length > 0) {
      message = new MensajeConMencion(message, rawMentions);
    }

    const validationRequest: ValidationRequest = {
      groupId,
      senderId,
      text: textContent,
      file: null,
      mensajeDecorado: message
    };

    let validationResult;
    try {
      validationResult = await this.validationChain.manejar(validationRequest);
      
      if (!validationResult.hasOwnProperty('mensaje')) {
        validationResult.mensaje = message;
      }
    } catch (e) {
      console.error('[CreatePoll] Excepción inesperada en la cadena de validación:', e);
      throw new Error('Ocurrió un error interno durante la validación de la encuesta');
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

    // Notificar al subject
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

    // Programar auto-cierre
    const encuestaMeta = (msgAny.metadata as Record<string, any>)?.encuesta || msgAny.encuesta;
    if (encuestaMeta && encuestaMeta.closesAt) {
      this.pollScheduler.schedule(groupId, messageId, new Date(encuestaMeta.closesAt));
    }

    return result;
  }
}
