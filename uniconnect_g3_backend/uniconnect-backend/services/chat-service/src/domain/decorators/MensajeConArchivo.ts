import { IMensaje } from '../IMensaje';
import { MensajeDecorator } from './MensajeDecorator';

export interface ArchivoParams {
  url: string;
  mimeType: string;
  tamano: number;
  fileName: string;
}

export class MensajeConArchivo extends MensajeDecorator {
  public url: string;
  public mimeType: string;
  public tamano: number;
  public fileName: string;
  public extension: string;
  public detectedType!: string;
  public icon!: string;

  constructor(mensaje: IMensaje, { url, mimeType, tamano, fileName }: ArchivoParams) {
    super(mensaje);
    this.url = url;
    this.mimeType = mimeType;
    this.tamano = tamano;
    this.fileName = fileName;
    
    const extension = fileName ? fileName.split('.').pop()?.toLowerCase() || '' : '';
    this.extension = extension;
    this._detectType(extension);
  }

  private _detectType(ext: string): void {
    this.detectedType = 'documento';
    this.icon = '📄';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      this.detectedType = 'imagen';
      this.icon = '🖼️';
    } else if (ext === 'pdf') {
      this.detectedType = 'pdf';
      this.icon = '📕';
    } else if (['doc', 'docx'].includes(ext)) {
      this.detectedType = 'documento_word';
      this.icon = '📘';
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      this.detectedType = 'documento_excel';
      this.icon = '📗';
    } else if (['ppt', 'pptx'].includes(ext)) {
      this.detectedType = 'documento_powerpoint';
      this.icon = '📙';
    } else if (['mp4', 'webm', 'mov'].includes(ext)) {
      this.detectedType = 'video';
      this.icon = '🎥';
    } else if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      this.detectedType = 'archivo_comprimido';
      this.icon = '📦';
    }
  }

  getMetadata(): Record<string, unknown> {
    const metadata = super.getMetadata();
    return {
      ...metadata,
      archivo: {
        url: this.url,
        mimeType: this.mimeType,
        tamano: this.tamano,
        fileName: this.fileName,
        detectedType: this.detectedType,
        icon: this.icon,
        extension: this.extension
      }
    };
  }

  render(): string {
    const rendered = super.render();
    return `${rendered} ${this.icon} (Archivo: ${this.fileName || this.url})`;
  }
}
