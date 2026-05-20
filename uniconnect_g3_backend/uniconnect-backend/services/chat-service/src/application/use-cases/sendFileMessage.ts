import { CloudinaryService } from '../../infrastructure/external/CloudinaryService';
import { SendMessage } from './sendMessage';
import { MulterFile } from '../validations/BaseHandler';

export class SendFileMessage {
  private cloudinaryService: CloudinaryService;
  private sendMessageUseCase: SendMessage;

  constructor(cloudinaryService: CloudinaryService, sendMessageUseCase: SendMessage) {
    this.cloudinaryService = cloudinaryService;
    this.sendMessageUseCase = sendMessageUseCase;
  }

  async execute(chatId: string, senderId: string, file: MulterFile, text?: string): Promise<{ fileUrl: string; fileName: string }> {
    if (!file) {
      throw new Error('FILE_NOT_UPLOADED');
    }

    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    await this.sendMessageUseCase.execute(chatId, senderId, {
      type: 'file',
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName,
      text: text || `Envió un archivo: ${uploadedFile.fileName}`
    });

    return {
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName
    };
  }
}
