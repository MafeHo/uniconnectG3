export class User {
  public uid: string;
  public name: string;
  public email: string;
  public lastLogin?: Date | string;
  public biography: string;
  public showEmail: boolean;
  public phone: string;
  public age: string | number;
  public studyPreference: string;

  constructor({
    uid,
    name,
    email,
    lastLogin,
    biography,
    showEmail,
    phone,
    age,
    studyPreference
  }: {
    uid: string;
    name: string;
    email: string;
    lastLogin?: Date | string;
    biography?: string;
    showEmail?: boolean;
    phone?: string;
    age?: string | number;
    studyPreference?: string;
  }) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.lastLogin = lastLogin;
    this.biography = biography || '';
    this.showEmail = showEmail ?? true;
    this.phone = phone || '';
    this.age = age || '';
    this.studyPreference = studyPreference || '';
  }
}
