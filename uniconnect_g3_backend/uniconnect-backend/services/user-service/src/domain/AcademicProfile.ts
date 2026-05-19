export class AcademicProfile {
  public studentId: string;
  public mappingId: string;
  public subjects: string[];
  public updatedAt: Date | any;

  constructor({
    studentId,
    mappingId,
    subjects,
    updatedAt
  }: {
    studentId: string;
    mappingId?: string;
    subjects?: string[];
    updatedAt?: Date | any;
  }) {
    this.studentId = studentId;
    this.mappingId = mappingId || '';
    this.subjects = subjects || [];
    this.updatedAt = updatedAt || new Date();
  }
}
