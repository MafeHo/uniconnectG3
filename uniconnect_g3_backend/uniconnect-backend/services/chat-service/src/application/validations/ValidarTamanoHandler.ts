import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';

export class ValidarTamanoHandler extends BaseHandler {
  private maxSize: number;

  constructor(maxSize = 1000) {
    super();
    this.maxSize = maxSize;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { text, mensajeDecorado } = request;

    let hasFile = false;
    if (mensajeDecorado && typeof mensajeDecorado.getMetadata === 'function') {
      const metadata = mensajeDecorado.getMetadata();
      if (metadata && metadata.archivo) {
        hasFile = true;
      }
    }

    if (text && text.length > this.maxSize) {
      return this.retornarError(
        'El mensaje excede el límite de caracteres permitido',
        'MESSAGE_TOO_LONG'
      );
    }

    if (!text && !hasFile) {
      return this.retornarError(
        'El mensaje no puede estar vacío',
        'MESSAGE_EMPTY'
      );
    }

    return await super.manejar(request);
  }
}
