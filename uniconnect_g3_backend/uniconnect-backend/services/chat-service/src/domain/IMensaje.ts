export abstract class IMensaje {
  abstract getContenido(): string;
  abstract getMetadata(): Record<string, unknown>;
  abstract render(): string;
}
