import { IMensaje } from '../IMensaje';

export class MensajeDecorator extends IMensaje {
  protected mensaje: IMensaje;

  constructor(mensaje: IMensaje) {
    super();
    this.mensaje = mensaje;
  }

  getContenido(): string {
    return this.mensaje.getContenido();
  }

  getMetadata(): Record<string, unknown> {
    return this.mensaje.getMetadata();
  }

  render(): string {
    return this.mensaje.render();
  }

  toJSON(): Record<string, unknown> {
    return {
      ...this.getMetadata(),
      content: this.getContenido(),
      renderedContent: this.render()
    };
  }
}
