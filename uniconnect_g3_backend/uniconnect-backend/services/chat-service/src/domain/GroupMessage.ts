import { MensajeBase } from './MensajeBase';

export interface GroupMessageParams {
  senderId: string;
  type?: string;
  text?: string;
  fileUrl?: string | null;
  fileName?: string | null;
}

export class GroupMessage extends MensajeBase {
  public senderId: string;
  public type: string;
  public text: string;
  public fileUrl: string | null;
  public fileName: string | null;

  constructor({ senderId, type = 'text', text = '', fileUrl = null, fileName = null }: GroupMessageParams) {
    // Inicializamos la base con el texto y metadata inicial
    super(text, { senderId, type });
    
    this.senderId = senderId;
    this.type = type;
    this.text = text; // Mantenemos text por compatibilidad
    this.fileUrl = fileUrl;
    this.fileName = fileName;
  }

  // Sobrescribimos getMetadata para incluir campos específicos de GroupMessage
  getMetadata(): Record<string, unknown> {
    const baseMetadata = super.getMetadata();
    const metadata: Record<string, unknown> = {
      ...baseMetadata,
      senderId: this.senderId,
      type: this.type
    };
    if (this.fileUrl) metadata.fileUrl = this.fileUrl;
    if (this.fileName) metadata.fileName = this.fileName;
    return metadata;
  }

  // Permite obtener la representación pura del mensaje para guardarlo
  toJSON(): Record<string, unknown> {
    return {
      ...this.getMetadata(),
      content: this.getContenido(),
      renderedContent: this.render()
    };
  }
}
