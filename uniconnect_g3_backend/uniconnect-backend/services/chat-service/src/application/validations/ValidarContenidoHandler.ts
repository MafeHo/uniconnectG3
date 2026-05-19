import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';

export class ValidarContenidoHandler extends BaseHandler {
  private palabrasProhibidas = ['spam', 'ofensa', 'grosería', 'maldición'];

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { text } = request;

    if (text) {
      const contenidoMinuscula = text.toLowerCase();
      const contieneOfensa = this.palabrasProhibidas.some(palabra => 
        contenidoMinuscula.includes(palabra)
      );

      if (contieneOfensa) {
        return this.retornarError(
          'El mensaje contiene palabras prohibidas o contenido ofensivo.',
          'OFFENSIVE_CONTENT'
        );
      }
    }

    return await super.manejar(request);
  }
}
