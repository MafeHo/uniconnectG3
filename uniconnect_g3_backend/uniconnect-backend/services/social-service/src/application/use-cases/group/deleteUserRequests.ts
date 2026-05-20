import { IGroupRequestRepository } from '../../../domain/repositories';

export class DeleteUserRequests {
  private groupRequestRepo: IGroupRequestRepository;

  constructor(groupRequestRepo: IGroupRequestRepository) {
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId: string, userId: string): Promise<any> {
    if (!groupId || !userId) {
      throw new Error('Faltan parámetros: groupId o userId');
    }
    
    const success = await this.groupRequestRepo.deleteByUserAndGroup(groupId, userId);
    return { success, message: 'Solicitudes antiguas eliminadas' };
  }
}
export default DeleteUserRequests;
