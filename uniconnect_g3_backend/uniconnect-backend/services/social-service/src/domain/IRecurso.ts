export abstract class IRecurso {
  abstract getContenido(): string;
  abstract getMetadata(): Record<string, unknown>;
}
