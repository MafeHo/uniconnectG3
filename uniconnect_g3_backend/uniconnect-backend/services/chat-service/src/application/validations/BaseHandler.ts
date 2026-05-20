import { IMensaje } from '../../domain/IMensaje';

export interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  [key: string]: unknown;
}

export interface ValidationRequest {
  text?: string;
  file?: MulterFile | null;
  groupId?: string;
  chatId?: string;
  senderId?: string;
  mentions?: string[];
  renderedText?: string;
  mensajeDecorado?: IMensaje;
  [key: string]: unknown;
}

export interface ValidationResult {
  esValido: boolean;
  error: string | null;
  codigo: string;
  mensaje?: IMensaje;
}

export class BaseHandler {
  protected siguiente: BaseHandler | null = null;

  setSiguiente(handler: BaseHandler): BaseHandler {
    this.siguiente = handler;
    return handler;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    if (this.siguiente) {
      return await this.siguiente.manejar(request);
    }
    return { 
      esValido: true, 
      error: null, 
      codigo: 'OK', 
      mensaje: request.mensajeDecorado 
    };
  }

  protected retornarError(error: string, codigo = 'VALIDATION_ERROR'): ValidationResult {
    return {
      esValido: false,
      error,
      codigo
    };
  }
}
