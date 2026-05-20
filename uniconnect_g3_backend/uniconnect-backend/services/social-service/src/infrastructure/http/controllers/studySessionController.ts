import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { SocialSchemas } from '@uniconnect/api-types';

interface UseCase {
  execute(...args: any[]): Promise<any>;
}

export interface SessionUseCases {
  createSession: UseCase;
  cancelSession: UseCase;
  getGroupSessions: UseCase;
  updateAttendance: UseCase;
  updateAvailability: UseCase;
}

export class StudySessionController {
  private createSessionUC: UseCase;
  private cancelSessionUC: UseCase;
  private getGroupSessionsUC: UseCase;
  private updateAttendanceUC: UseCase;
  private updateAvailabilityUC: UseCase;

  constructor(useCases: SessionUseCases) {
    this.createSessionUC = useCases.createSession;
    this.cancelSessionUC = useCases.cancelSession;
    this.getGroupSessionsUC = useCases.getGroupSessions;
    this.updateAttendanceUC = useCases.updateAttendance;
    this.updateAvailabilityUC = useCases.updateAvailability;
  }

  createSession = asyncHandler(async (req: Request, res: Response) => {
    const data = SocialSchemas.CreateStudySessionRequestSchema.parse(req.body);
    const { groupId } = req.params;
    const result = await this.createSessionUC.execute(groupId, data.creatorId, data);
    res.status(201).json(result);
  });

  cancelSession = asyncHandler(async (req: Request, res: Response) => {
    const { groupId, sessionId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'El userId es requerido en el cuerpo de la solicitud.' });
      return;
    }
    const result = await this.cancelSessionUC.execute(groupId, sessionId, userId);
    res.json(result);
  });

  getGroupSessions = asyncHandler(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: 'El query parameter userId es requerido.' });
      return;
    }
    const sessions = await this.getGroupSessionsUC.execute(groupId, userId);
    res.json(sessions);
  });

  updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const data = SocialSchemas.UpdateAttendanceRequestSchema.parse(req.body);
    const { groupId, sessionId } = req.params;
    const result = await this.updateAttendanceUC.execute(groupId, sessionId, data.userId, data.status);
    res.json(result);
  });

  updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const data = SocialSchemas.UpdateAvailabilityRequestSchema.parse(req.body);
    const { groupId } = req.params;
    const result = await this.updateAvailabilityUC.execute(groupId, data.userId, data.availability);
    res.json(result);
  });
}

export default StudySessionController;
