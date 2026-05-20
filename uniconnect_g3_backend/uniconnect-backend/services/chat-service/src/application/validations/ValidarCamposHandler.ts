import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';

export class ValidarCamposHandler extends BaseHandler {
  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { text, file } = request;

    const tieneTexto = text && text.trim().length > 0;
    const tieneArchivo = !!file;

    if (!tieneTexto && !tieneArchivo) {
      return this.retornarError(
        'El mensaje debe contener texto o un archivo adjunto.',
        'MISSING_CONTENT'
      );
    }

    return await super.manejar(request);
  }
}
