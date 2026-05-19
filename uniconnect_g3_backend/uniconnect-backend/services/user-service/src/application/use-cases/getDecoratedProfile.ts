import { User } from '@uniconnect/shared';
import { PerfilBase } from '../../domain/decorators/PerfilBase';
import { PerfilConEstadisticas } from '../../domain/decorators/PerfilConEstadisticas';
import { PerfilConInsignias } from '../../domain/decorators/PerfilConInsignias';
import { PerfilComponent } from '../../domain/decorators/PerfilDecorator';
import { IStatsRepository } from '../../domain/repositories';
import GetFullProfile from './getFullProfile';

export default class GetDecoratedProfile {
  private getFullProfileUC: GetFullProfile;
  private statsRepo: IStatsRepository;

  constructor(getFullProfileUC: GetFullProfile, statsRepo: IStatsRepository) {
    this.getFullProfileUC = getFullProfileUC;
    this.statsRepo = statsRepo;
  }

  async execute(studentId: string, viewType: string): Promise<User> {
    // 1. Get base profile
    const profileData = await this.getFullProfileUC.execute(studentId);
    
    // 2. Wrap in base decorator
    let perfil: PerfilComponent = new PerfilBase(profileData);

    // 3. Apply decorators if 'vista=completa'
    if (viewType === 'completa') {
      const stats = await this.statsRepo.getStudentStats(studentId);
      perfil = new PerfilConEstadisticas(perfil, stats);
      perfil = new PerfilConInsignias(perfil);
    }

    return perfil.getProfileData();
  }
}
