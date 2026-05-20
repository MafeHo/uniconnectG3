import { IGroupMessageRepository, IGroupMemberRepository } from '../../domain/repositories';
import chatSubject from '../observer/ChatSubject';
import { ChatEvents } from '../../domain/observer/ISubject';

export class VotePoll {
  private groupMessageRepo: IGroupMessageRepository;
  private groupMemberRepo: IGroupMemberRepository;

  constructor(
    groupMessageRepo: IGroupMessageRepository,
    groupMemberRepo: IGroupMemberRepository
  ) {
    this.groupMessageRepo = groupMessageRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(
    groupId: string,
    messageId: string,
    userId: string,
    optionIndex: number
  ): Promise<Record<string, unknown>> {
    // 1. Validar que el usuario es miembro del grupo
    const isMember = await this.groupMemberRepo.isMember(groupId, userId);
    if (!isMember) {
      const err = new Error('El usuario no es miembro del grupo de estudio') as Error & { codigo?: string };
      err.codigo = 'NOT_A_MEMBER';
      throw err;
    }

    // 2. Obtener el mensaje de la encuesta
    const msg = await this.groupMessageRepo.getById(groupId, messageId);
    if (!msg) {
      const err = new Error('La encuesta no fue encontrada') as Error & { codigo?: string };
      err.codigo = 'POLL_NOT_FOUND';
      throw err;
    }

    // 3. Extraer y validar el objeto de la encuesta
    const metadata = (msg.metadata || {}) as Record<string, any>;
    const encuesta = metadata.encuesta || msg.encuesta;

    if (!encuesta) {
      const err = new Error('El mensaje especificado no contiene una encuesta') as Error & { codigo?: string };
      err.codigo = 'NOT_A_POLL';
      throw err;
    }

    // 4. Validar que la encuesta no esté cerrada ni expirada
    if (encuesta.isClosed) {
      const err = new Error('La encuesta ya está cerrada') as Error & { codigo?: string };
      err.codigo = 'POLL_CLOSED';
      throw err;
    }

    const closesAtTime = new Date(encuesta.closesAt).getTime();
    if (closesAtTime < Date.now()) {
      const err = new Error('La encuesta ya ha expirado') as Error & { codigo?: string };
      err.codigo = 'POLL_EXPIRED';
      throw err;
    }

    // 5. Validar que la opción seleccionada existe
    if (optionIndex < 0 || optionIndex >= encuesta.options.length) {
      const err = new Error('La opción seleccionada es inválida') as Error & { codigo?: string };
      err.codigo = 'INVALID_OPTION';
      throw err;
    }

    // 6. Validar voto único (Criterio 5)
    const votes = (encuesta.votes || {}) as Record<string, string[]>;
    
    // Asegurarse de que todas las opciones tengan una lista inicializada de votos
    encuesta.options.forEach((_: string, idx: number) => {
      const key = String(idx);
      if (!votes[key]) {
        votes[key] = [];
      }
    });

    for (const key of Object.keys(votes)) {
      if (Array.isArray(votes[key]) && votes[key].includes(userId)) {
        const err = new Error('Ya registraste tu voto en esta encuesta') as Error & { codigo?: string };
        err.codigo = 'DUPLICATE_VOTE';
        throw err;
      }
    }

    // 7. Registrar el voto
    const optionKey = String(optionIndex);
    votes[optionKey].push(userId);

    // 8. Calcular totales y porcentajes (Criterio 4)
    const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
    const results = encuesta.options.map((optionText: string, idx: number) => {
      const optVotes = (votes[String(idx)] || []).length;
      return {
        text: optionText,
        votes: optVotes,
        percentage: totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0,
        voters: votes[String(idx)] || []
      };
    });

    // 9. Actualizar Firestore
    encuesta.votes = votes;
    metadata.encuesta = encuesta;

    await this.groupMessageRepo.update(groupId, messageId, {
      metadata: metadata
    });

    // 10. Difundir en tiempo real (Criterio 2)
    chatSubject.notify(ChatEvents.ENCUESTA_ACTUALIZADA, {
      groupId,
      messageId,
      results,
      totalVotes
    });

    return {
      success: true,
      results,
      totalVotes
    };
  }
}
