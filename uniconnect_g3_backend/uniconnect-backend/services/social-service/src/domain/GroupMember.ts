import { Activo } from './states/Activo';
import { PendienteTransferencia } from './states/PendienteTransferencia';
import { TransferenciaAceptada } from './states/TransferenciaAceptada';
import { Disuelto } from './states/Disuelto';
import { Bloqueado } from './states/Bloqueado';
import { IEstadoGrupo } from './states/IEstadoGrupo';

export class GroupMember {
  public groupId: string;
  public userId: string;
  public role: string;
  public joinedAt: Date;
  public state: IEstadoGrupo | null;

  // Dynamic parameters utilized by concrete states
  public candidateId?: string;
  public userName?: string;
  public requesterId?: string;

  constructor({
    groupId,
    userId,
    role,
    joinedAt,
    state,
  }: {
    groupId: string;
    userId: string;
    role?: string;
    joinedAt?: Date | any;
    state?: IEstadoGrupo | null;
  }) {
    this.groupId = groupId;
    this.userId = userId;
    this.role = role || 'student';
    this.joinedAt = joinedAt instanceof Date ? joinedAt : new Date();
    this.state = state || null;
  }

  transitionTo(stateName: string): void {
    const subject = this.state ? this.state.subject : null;

    switch (stateName) {
      case 'Activo':
        this.state = new Activo(subject);
        break;
      case 'PendienteTransferencia':
        this.state = new PendienteTransferencia(subject);
        break;
      case 'TransferenciaAceptada':
        this.state = new TransferenciaAceptada(subject);
        break;
      case 'Disuelto':
        this.state = new Disuelto(subject);
        break;
      case 'Bloqueado':
        this.state = new Bloqueado(subject);
        break;
      default:
        throw new Error(`State ${stateName} is not recognized.`);
    }
  }

  async solicitar(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.solicitar(this);
  }

  async aceptar(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.aceptar(this);
  }

  async rechazar(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.rechazar(this);
  }

  async transferir(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.transferir(this);
  }

  async disolver(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.disolver(this);
  }

  async bloquear(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.bloquear(this);
  }

  async desbloquear(): Promise<any> {
    if (!this.state) throw new Error('STATE_NOT_INITIALIZED');
    return this.state.desbloquear(this);
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
