import { IRecurso } from '../IRecurso';
import { RecursoDecorator } from './RecursoDecorator';
import { ResourceComment } from '../RecursoBase';

export class RecursoConComentarios extends RecursoDecorator {
  private comment: ResourceComment;

  constructor(recurso: IRecurso, comment: ResourceComment) {
    super(recurso);
    this.comment = comment;
  }

  getMetadata(): Record<string, unknown> {
    const meta = super.getMetadata();
    const comments = [...((meta.comments as ResourceComment[]) || [])];
    
    // Añadir el comentario
    comments.push({
      ...this.comment,
      createdAt: this.comment.createdAt || new Date().toISOString()
    });

    return {
      ...meta,
      comments
    };
  }
}
