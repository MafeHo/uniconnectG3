import { IMensaje } from '../IMensaje';
import { MensajeDecorator } from './MensajeDecorator';

export class MensajeConMencion extends MensajeDecorator {
  public userIds: string[];

  constructor(mensaje: IMensaje, userIds: string[]) {
    super(mensaje);
    this.userIds = userIds || [];
  }

  getMetadata(): Record<string, unknown> {
    const metadata = super.getMetadata();
    return {
      ...metadata,
      menciones: this.userIds
    };
  }

  render(): string {
    let rendered = super.render();
    this.userIds.forEach(userId => {
      // Resaltar el ID del usuario mencionado
      const regex = new RegExp(`@${userId}`, 'g');
      rendered = rendered.replace(regex, `**@${userId}**`);
    });
    return rendered;
  }
}
