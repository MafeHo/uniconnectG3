import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { GetOrCreateChat } from '../../../application/use-cases/getOrCreateChat';
import { SendMessage } from '../../../application/use-cases/sendMessage';
import { SendFileMessage } from '../../../application/use-cases/sendFileMessage';
import { GetMessages } from '../../../application/use-cases/getMessages';
import { AddReaction } from '../../../application/use-cases/addReaction';
import { MulterFile } from '../../../application/validations/BaseHandler';
import { ChatSchemas } from '@uniconnect/api-types';

interface ChatControllerDeps {
  getOrCreateChat: GetOrCreateChat;
  sendMessage: SendMessage;
  sendFileMessage: SendFileMessage;
  getMessages: GetMessages;
  addReaction: AddReaction;
}

export class ChatController {
  private getOrCreateChatUC: GetOrCreateChat;
  private sendMessageUC: SendMessage;
  private sendFileMessageUC: SendFileMessage;
  private getMessagesUC: GetMessages;
  private addReactionUC: AddReaction;

  constructor(useCases: ChatControllerDeps) {
    this.getOrCreateChatUC = useCases.getOrCreateChat;
    this.sendMessageUC = useCases.sendMessage;
    this.sendFileMessageUC = useCases.sendFileMessage;
    this.getMessagesUC = useCases.getMessages;
    this.addReactionUC = useCases.addReaction;
  }

  createChat = asyncHandler(async (req: Request, res: Response) => {
    const bodyToValidate = req.body.participants
      ? req.body
      : { participants: [req.body.userA, req.body.userB].filter(Boolean) };

    const { participants } = ChatSchemas.CreateChatRequestSchema.parse(bodyToValidate);
    const [userA, userB] = participants;
    const chatId = await this.getOrCreateChatUC.execute(userA, userB);
    res.json({ chatId });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = ChatSchemas.ChatIdParamSchema.parse(req.params);
    const validatedBody = ChatSchemas.SendChatMessageRequestSchema.parse({
      senderId: req.body.senderId,
      content: req.body.text,
      type: 'text'
    });

    await this.sendMessageUC.execute(chatId, validatedBody.senderId, validatedBody.content);
    res.sendStatus(200);
  });

  sendFileMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = ChatSchemas.ChatIdParamSchema.parse(req.params);
    const file = (req as Request & { file?: MulterFile }).file;
    if (!file) {
      return res.status(400).json({ error: "Archivo no subido" });
    }

    const validatedBody = ChatSchemas.SendChatMessageRequestSchema.parse({
      senderId: req.body.senderId,
      content: req.body.text || '',
      type: 'file',
      fileURL: file.path,
      fileName: file.originalname,
      fileSize: file.size
    });

    const result = await this.sendFileMessageUC.execute(chatId, validatedBody.senderId, file, validatedBody.content);
    res.json(result);
  });

  getMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = ChatSchemas.ChatIdParamSchema.parse(req.params);
    const messages = await this.getMessagesUC.execute(chatId);
    res.json({ messages });
  });

  addReaction = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, messageId } = ChatSchemas.ChatMessageParamsSchema.parse(req.params);
    const validatedBody = ChatSchemas.AddChatReactionRequestSchema.parse({
      userId: req.body.userId,
      reaction: req.body.emoji
    });

    const result = await this.addReactionUC.execute(chatId, messageId, validatedBody.reaction, validatedBody.userId);
    res.json(result);
  });
}

