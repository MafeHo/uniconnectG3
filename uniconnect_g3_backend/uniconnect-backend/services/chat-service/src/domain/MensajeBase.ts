import { IMensaje } from './IMensaje';

export class MensajeBase extends IMensaje {
  protected contenido: string;
  protected metadata: Record<string, unknown>;

  constructor(contenido: string, metadata: Record<string, unknown> = {}) {
    super();
    this.contenido = contenido;
    this.metadata = metadata;
  }

  getContenido(): string {
    return this.contenido;
  }

  getMetadata(): Record<string, unknown> {
    return this.metadata;
  }

  render(): string {
    return this.contenido;
  }
}
