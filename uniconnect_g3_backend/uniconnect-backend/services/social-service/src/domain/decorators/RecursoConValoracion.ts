import { IRecurso } from '../IRecurso';
import { RecursoDecorator } from './RecursoDecorator';

export class RecursoConValoracion extends RecursoDecorator {
  private userId: string;
  private score: number;

  constructor(recurso: IRecurso, userId: string, score: number) {
    super(recurso);
    if (score < 1 || score > 5) {
      throw new Error('INVALID_RATING');
    }
    this.userId = userId;
    this.score = score;
  }

  getMetadata(): Record<string, unknown> {
    const meta = super.getMetadata();
    const ratings = { ...((meta.ratings as Record<string, number>) || {}) };
    
    // Asignar/actualizar la valoración del usuario
    ratings[this.userId] = this.score;

    // Recalcular promedio
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    const averageRating = values.length > 0 ? Math.round((sum / values.length) * 10) / 10 : 0;

    return {
      ...meta,
      ratings,
      averageRating
    };
  }
}
