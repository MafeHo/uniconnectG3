import type { User as SharedUser } from '@uniconnect/shared';

export class User implements SharedUser {
  uid: string;
  name: string;
  email: string;
  lastLogin?: Date | string | number;
  biography?: string;
  showEmail?: boolean;
  phone?: string;
  age?: number | string;
  studyPreference?: string;

  constructor(data: Partial<SharedUser>) {
    this.uid = data.uid || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.lastLogin = data.lastLogin;
    this.biography = data.biography || '';
    this.showEmail = data.showEmail ?? true;
    this.phone = data.phone || '';
    this.age = data.age || '';
    this.studyPreference = data.studyPreference || '';
  }
}
