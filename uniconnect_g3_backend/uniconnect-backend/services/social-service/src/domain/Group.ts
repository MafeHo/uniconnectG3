export class Group {
  public id?: string;
  public name: string;
  public subjectId: string;
  public description: string;
  public creatorId: string;
  public createdAt: Date;
  public updatedAt: Date;
  /** Estado del grupo (patrón State) */
  public state?: string;
  /** Transferencia de admin pendiente */
  public pendingAdminTransfer?: {
    candidateId: string;
    candidateName?: string;
    requesterId?: string;
    status?: string;
    requestedAt?: Date;
  } | null;
  /** Nombre de la materia (enriquecido en queries de búsqueda) */
  public subjectName?: string;

  constructor({
    id,
    name,
    subjectId,
    description,
    creatorId,
    createdAt,
    updatedAt,
    state,
    pendingAdminTransfer,
    subjectName,
  }: {
    id?: string;
    name: string;
    subjectId: string;
    description?: string;
    creatorId: string;
    createdAt?: Date | unknown;
    updatedAt?: Date | unknown;
    state?: string;
    pendingAdminTransfer?: { candidateId: string; candidateName?: string } | null;
    subjectName?: string;
  }) {
    this.id = id;
    this.name = name;
    this.subjectId = subjectId;
    this.description = description || '';
    this.creatorId = creatorId;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date();
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date();
    this.state = state;
    this.pendingAdminTransfer = pendingAdminTransfer;
    this.subjectName = subjectName;
  }

  validate(): void {
    if (!this.name || this.name.length < 3) {
      throw new Error('NAME_TOO_SHORT');
    }
    if (!this.subjectId) {
      throw new Error('MISSING_FIELDS');
    }
    if (!this.creatorId) {
      throw new Error('MISSING_FIELDS');
    }
  }
}
