import { IRecurso } from '../IRecurso';

export class RecursoDecorator extends IRecurso {
  protected recurso: IRecurso;

  constructor(recurso: IRecurso) {
    super();
    this.recurso = recurso;
  }

  getContenido(): string {
    return this.recurso.getContenido();
  }

  getMetadata(): Record<string, unknown> {
    return this.recurso.getMetadata();
  }
}
