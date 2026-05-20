import { User, Estadisticas } from '@uniconnect/shared';
import { PerfilDecorator, PerfilComponent } from './PerfilDecorator';

export class PerfilConEstadisticas extends PerfilDecorator {
  private stats: Partial<Estadisticas>;

  constructor(perfil: PerfilComponent, stats: Partial<Estadisticas>) {
    super(perfil);
    this.stats = stats || {};
  }

  getProfileData(): User {
    const baseData = super.getProfileData();
    return {
      ...baseData,
      estadisticas: {
        gruposCreados: this.stats.gruposCreados || 0,
        gruposParticipa: this.stats.gruposParticipa || 0,
        mensajesEnviados: this.stats.mensajesEnviados || 0
      }
    };
  }
}
