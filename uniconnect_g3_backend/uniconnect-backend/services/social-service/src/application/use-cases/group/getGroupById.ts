import { IGroupRepository, IGroupMemberRepository, IGroupRequestRepository, IAcademicCatalogRepository, IUserRepository } from '../../../domain/repositories';
import { Activo } from '../../../domain/states/Activo';
import { PendienteTransferencia } from '../../../domain/states/PendienteTransferencia';

interface GroupState {
  getFriendlyName(): string;
  isExitLocked(context: any, userId: string): boolean;
}

export class GetGroupById {
  private groupRepo: IGroupRepository;
  private groupMemberRepo: IGroupMemberRepository;
  private groupRequestRepo: IGroupRequestRepository;
  private catalogRepo: IAcademicCatalogRepository;
  private userRepo: IUserRepository;

  constructor(
    groupRepo: IGroupRepository,
    groupMemberRepo: IGroupMemberRepository,
    groupRequestRepo: IGroupRequestRepository,
    catalogRepo: IAcademicCatalogRepository,
    userRepo: IUserRepository
  ) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute(groupId: string, userId: string | null = null): Promise<any> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) return null;

    const subject = await this.catalogRepo.findSubjectById(group.subjectId);
    const subjectName = subject ? subject.name : 'Materia desconocida';

    const members = await this.groupMemberRepo.findByGroupId(groupId);
    const memberIds = members.map(m => m.userId);
    const memberUsers = await this.userRepo.findByIds(memberIds);

    const memberDetails = memberUsers.map(u => ({
      id: u.id,
      name: u.exists !== false ? u.name : 'Usuario desconocido',
      role: members.find(m => m.userId === u.id)?.role || 'student'
    }));

    let dbStatus = 'none';
    let requesterId: string | null = null;

    if (userId) {
      if (group.pendingAdminTransfer && group.pendingAdminTransfer.status === 'pending' && (group.creatorId === userId || group.pendingAdminTransfer.candidateId === userId)) {
        dbStatus = 'transfer_pending';
        requesterId = group.pendingAdminTransfer.requesterId ?? null;
      } else if (group.creatorId === userId) {
        dbStatus = 'admin';
      } else if (memberIds.includes(userId)) {
        dbStatus = 'member';
      } else {
        const request = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
        if (request) {
          dbStatus = request.status || 'pending';
        }
      }
    }

    class GroupContext {
      public state: GroupState | null = null;
      public requesterId: string | null;

      constructor(status: string, reqId: string | null) {
        this.requesterId = reqId;
        switch (status) {
          case 'pending': 
            this.state = { getFriendlyName: () => 'Pendiente de Ingreso', isExitLocked: () => false }; 
            break;
          case 'member':
          case 'admin': 
            this.state = new Activo(null); 
            break;
          case 'transfer_pending': 
            this.state = new PendienteTransferencia(null); 
            break;
          case 'rejected': 
            this.state = { getFriendlyName: () => 'Rechazado', isExitLocked: () => false }; 
            break;
          default: 
            this.state = null;
        }
      }
      getState() { return this.state; }
    }

    const context = new GroupContext(dbStatus, requesterId);
    let userStatus = dbStatus === 'none' ? 'none' : 'Desconocido';
    let isExitLocked = false;

    const state = context.getState();
    if (state) {
      userStatus = state.getFriendlyName();
      isExitLocked = state.isExitLocked(context, userId || '');
    }

    return {
      ...group,
      subjectName,
      members: memberDetails,
      userStatus,
      isExitLocked
    };
  }
}
export default GetGroupById;
