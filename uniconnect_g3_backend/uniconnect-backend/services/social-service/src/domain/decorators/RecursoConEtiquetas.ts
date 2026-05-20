import { IRecurso } from '../IRecurso';
import { RecursoDecorator } from './RecursoDecorator';

export class RecursoConEtiquetas extends RecursoDecorator {
  private tags: string[];

  constructor(recurso: IRecurso, tags: string[]) {
    super(recurso);
    this.tags = tags || [];
  }

  getMetadata(): Record<string, unknown> {
    const meta = super.getMetadata();
    const existingTags = (meta.tags as string[]) || [];
    const mergedTags = Array.from(new Set([...existingTags, ...this.tags]));
    return {
      ...meta,
      tags: mergedTags
    };
  }
}
