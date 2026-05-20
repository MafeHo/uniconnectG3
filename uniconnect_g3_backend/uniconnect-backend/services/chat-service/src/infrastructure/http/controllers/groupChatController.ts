import { Request, Response } from 'express';
import { SendGroupMessage } from '../../../application/use-cases/sendGroupMessage';
import { AddGroupReaction } from '../../../application/use-cases/addGroupReaction';
import { CreatePoll } from '../../../application/use-cases/createPoll';
import { VotePoll } from '../../../application/use-cases/votePoll';
import { IGroupMessageRepository } from '../../../domain/repositories';
import { MulterFile } from '../../../application/validations/BaseHandler';
import { ZodError } from 'zod';
import { ChatSchemas } from '@uniconnect/api-types';

interface GroupChatControllerDeps {
  sendGroupMessage: SendGroupMessage;
  addGroupReaction: AddGroupReaction;
  createPoll: CreatePoll;
  votePoll: VotePoll;
  groupMessageRepo: IGroupMessageRepository;
}

export class GroupChatController {
  private sendGroupMessage: SendGroupMessage;
  private addGroupReactionUC: AddGroupReaction;
  private createPollUC: CreatePoll;
  private votePollUC: VotePoll;
  private groupMessageRepo: IGroupMessageRepository;

  constructor({ sendGroupMessage, addGroupReaction, createPoll, votePoll, groupMessageRepo }: GroupChatControllerDeps) {
    this.sendGroupMessage = sendGroupMessage;
    this.addGroupReactionUC = addGroupReaction;
    this.createPollUC = createPoll;
    this.votePollUC = votePoll;
    this.groupMessageRepo = groupMessageRepo;

    // Bind this para asegurar el contexto de ejecución
    this.sendMessage = this.sendMessage.bind(this);
    this.sendFileMessage = this.sendFileMessage.bind(this);
    this.addGroupReaction = this.addGroupReaction.bind(this);
    this.createPoll = this.createPoll.bind(this);
    this.votePoll = this.votePoll.bind(this);
    this.getPollResults = this.getPollResults.bind(this);
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { groupId } = ChatSchemas.GroupChatParamsSchema.parse(req.params);
      const validatedBody = ChatSchemas.SendGroupMessageRequestSchema.parse({
        senderId: req.body.senderId,
        content: req.body.text,
        type: 'text'
      });

      const result = await this.sendGroupMessage.execute(groupId, validatedBody.senderId, {
        text: validatedBody.content,
        type: 'text'
      });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error sending group message:', error);
      res.status(500).json({ error: 'Error al enviar mensaje grupal' });
    }
  }

  async sendFileMessage(req: Request, res: Response) {
    try {
      const { groupId } = ChatSchemas.GroupChatParamsSchema.parse(req.params);
      const file = (req as Request & { file?: MulterFile }).file;

      if (!file) {
        return res.status(400).json({ error: 'Faltan parámetros (file)' });
      }

      const validatedBody = ChatSchemas.SendGroupMessageRequestSchema.parse({
        senderId: req.body.senderId,
        content: req.body.text || '',
        type: 'file',
        fileURL: file.path,
        fileName: file.originalname,
        fileSize: file.size
      });

      const result = await this.sendGroupMessage.execute(groupId, validatedBody.senderId, { text: validatedBody.content }, file);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error sending group file message:', error);
      res.status(500).json({ error: 'Error al enviar archivo en grupo' });
    }
  }

  async addGroupReaction(req: Request, res: Response) {
    try {
      const { groupId, messageId } = ChatSchemas.GroupMessageParamsSchema.parse(req.params);
      const validatedBody = ChatSchemas.GroupReactionRequestSchema.parse({
        userId: req.body.userId,
        reaction: req.body.emoji
      });

      const result = await this.addGroupReactionUC.execute(groupId, messageId, validatedBody.reaction, validatedBody.userId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error adding group reaction:', error);
      res.status(500).json({ error: 'Error al reaccionar al mensaje' });
    }
  }

  async createPoll(req: Request, res: Response) {
    try {
      const { groupId } = ChatSchemas.GroupChatParamsSchema.parse(req.params);
      const validatedBody = ChatSchemas.CreatePollRequestSchema.parse(req.body);

      const result = await this.createPollUC.execute(groupId, validatedBody.senderId, {
        question: validatedBody.question,
        options: validatedBody.options,
        duration: validatedBody.duration,
        text: validatedBody.text
      });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error creating poll:', error);
      res.status(500).json({ error: 'Error al crear la encuesta' });
    }
  }

  async votePoll(req: Request, res: Response) {
    try {
      const { groupId, messageId } = ChatSchemas.PollParamsSchema.parse(req.params);
      const validatedBody = ChatSchemas.VotePollRequestSchema.parse(req.body);

      const result = await this.votePollUC.execute(groupId, messageId, validatedBody.userId, validatedBody.optionIndex);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error voting in poll:', error);
      
      if (error.codigo === 'DUPLICATE_VOTE') {
        return res.status(409).json({ error: error.message, codigo: error.codigo });
      }
      if (error.codigo === 'POLL_CLOSED' || error.codigo === 'POLL_EXPIRED') {
        return res.status(410).json({ error: error.message, codigo: error.codigo });
      }
      if (error.codigo === 'POLL_NOT_FOUND') {
        return res.status(404).json({ error: error.message, codigo: error.codigo });
      }
      if (error.codigo === 'INVALID_OPTION') {
        return res.status(400).json({ error: error.message, codigo: error.codigo });
      }
      res.status(500).json({ error: error.message || 'Error al registrar el voto' });
    }
  }

  async getPollResults(req: Request, res: Response) {
    try {
      const { groupId, messageId } = ChatSchemas.PollParamsSchema.parse(req.params);
      const msg = await this.groupMessageRepo.getById(groupId, messageId);

      if (!msg) {
        return res.status(404).json({ error: 'La encuesta no fue encontrada' });
      }

      const metadata = (msg.metadata || {}) as Record<string, any>;
      const encuesta = metadata.encuesta || msg.encuesta;

      if (!encuesta) {
        return res.status(400).json({ error: 'El mensaje especificado no contiene una encuesta' });
      }

      const votes = (encuesta.votes || {}) as Record<string, string[]>;
      encuesta.options.forEach((_: string, idx: number) => {
        if (!votes[String(idx)]) {
          votes[String(idx)] = [];
        }
      });

      const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
      const optionsWithResults = encuesta.options.map((optionText: string, idx: number) => {
        const optVotes = (votes[String(idx)] || []).length;
        return {
          text: optionText,
          votes: optVotes,
          percentage: totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0,
          voters: votes[String(idx)] || []
        };
      });

      res.status(200).json({
        question: encuesta.question,
        options: optionsWithResults,
        totalVotes,
        isClosed: encuesta.isClosed,
        closesAt: encuesta.closesAt,
        creatorId: encuesta.creatorId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error('Error fetching poll results:', error);
      res.status(500).json({ error: 'Error al obtener los resultados de la encuesta' });
    }
  }
}

