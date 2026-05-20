import { IMensaje } from '../IMensaje';
import { MensajeDecorator } from './MensajeDecorator';

export interface EncuestaParams {
  question: string;
  options: string[];
  duration: number; // en minutos
  creatorId: string;
}

export interface EncuestaVotes {
  [optionIndex: string]: string[];
}

export class MensajeConEncuesta extends MensajeDecorator {
  public question: string;
  public options: string[];
  public votes: EncuestaVotes;
  public duration: number;
  public creatorId: string;
  public closesAt: string;
  public isClosed: boolean;

  constructor(mensaje: IMensaje, { question, options, duration, creatorId }: EncuestaParams) {
    super(mensaje);
    this.question = question;
    this.options = options;
    this.duration = duration;
    this.creatorId = creatorId;
    this.isClosed = false;

    // Inicializar el objeto de votos para cada opción vacía
    const initialVotes: EncuestaVotes = {};
    options.forEach((_, idx) => {
      initialVotes[String(idx)] = [];
    });
    this.votes = initialVotes;

    // Calcular la fecha de cierre closesAt = ahora + duración * 60000ms
    this.closesAt = new Date(Date.now() + duration * 60000).toISOString();
  }

  getMetadata(): Record<string, unknown> {
    const metadata = super.getMetadata();
    return {
      ...metadata,
      encuesta: {
        question: this.question,
        options: this.options,
        votes: this.votes,
        duration: this.duration,
        creatorId: this.creatorId,
        closesAt: this.closesAt,
        isClosed: this.isClosed
      }
    };
  }

  render(): string {
    const base = super.render();
    return `${base} 📊 Encuesta: ${this.question} [${this.options.join(' | ')}]`;
  }
}
