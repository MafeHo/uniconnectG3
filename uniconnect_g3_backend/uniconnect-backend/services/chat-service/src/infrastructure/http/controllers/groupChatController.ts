import { Request, Response } from 'express';
import { SendGroupMessage } from '../../../application/use-cases/sendGroupMessage';
import { AddGroupReaction } from '../../../application/use-cases/addGroupReaction';
import { MulterFile } from '../../../application/validations/BaseHandler';
import { ZodError } from 'zod';
import { ChatSchemas } from '@uniconnect/api-types';

interface GroupChatControllerDeps {
  sendGroupMessage: SendGroupMessage;
  addGroupReaction: AddGroupReaction;
}

export class GroupChatController {
  private sendGroupMessage: SendGroupMessage;
  private addGroupReactionUC: AddGroupReaction;

  constructor({ sendGroupMessage, addGroupReaction }: GroupChatControllerDeps) {
    this.sendGroupMessage = sendGroupMessage;
    this.addGroupReactionUC = addGroupReaction;

    // Bind this para asegurar el contexto de ejecución
    this.sendMessage = this.sendMessage.bind(this);
    this.sendFileMessage = this.sendFileMessage.bind(this);
    this.addGroupReaction = this.addGroupReaction.bind(this);
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
}

