import { User } from '@uniconnect/shared';
import { PerfilComponent } from './PerfilDecorator';

export class PerfilBase implements PerfilComponent {
  private profileData: User;

  constructor(profileData: User) {
    this.profileData = profileData;
  }

  getProfileData(): User {
    return this.profileData;
  }
}
