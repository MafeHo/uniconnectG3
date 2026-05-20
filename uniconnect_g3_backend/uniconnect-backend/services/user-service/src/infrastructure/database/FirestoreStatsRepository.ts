import * as admin from 'firebase-admin';
import { Estadisticas } from '@uniconnect/shared';
import { IStatsRepository } from '../../domain/repositories';

export default class FirestoreStatsRepository implements IStatsRepository {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getStudentStats(studentId: string): Promise<Estadisticas> {
    try {
      // Get groups where student is admin (gruposCreados)
      const groupsAdminSnapshot = await this.db.collection('groups')
        .where('creatorId', '==', studentId)
        .get();
      const gruposCreados = groupsAdminSnapshot.size;

      // Get groups where student is member (gruposParticipa)
      const groupsMemberSnapshot = await this.db.collection('group_members')
        .where('userId', '==', studentId)
        .get();
      const gruposParticipa = groupsMemberSnapshot.size;

      // Get messages sent by student (mensajesEnviados) - Usando collectionGroup porque messages es una subcolección de groups
      const messagesSnapshot = await this.db.collectionGroup('messages')
        .where('senderId', '==', studentId)
        .get();
      const mensajesEnviados = messagesSnapshot.size;

      return {
        gruposCreados,
        gruposParticipa,
        mensajesEnviados
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        gruposCreados: 0,
        gruposParticipa: 0,
        mensajesEnviados: 0
      };
    }
  }
}
