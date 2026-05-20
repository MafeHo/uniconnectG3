import { User } from '@uniconnect/shared';

export interface PerfilComponent {
  getProfileData(): User;
}

export class PerfilDecorator implements PerfilComponent {
  protected perfil: PerfilComponent;

  constructor(perfil: PerfilComponent) {
    this.perfil = perfil;
  }

  getProfileData(): User {
    return this.perfil.getProfileData();
  }
}
