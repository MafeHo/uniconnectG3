import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import GetFullProfile from '../../../application/use-cases/getFullProfile';
import SaveAcademicProfile from '../../../application/use-cases/saveAcademicProfile';
import GetDecoratedProfile from '../../../application/use-cases/getDecoratedProfile';
import { UserSchemas } from '@uniconnect/api-types';

interface ProfileControllerUseCases {
  getFullProfile: GetFullProfile;
  saveAcademicProfile: SaveAcademicProfile;
  getDecoratedProfile: GetDecoratedProfile;
}

export default class ProfileController {
  private saveAcademicProfileUC: SaveAcademicProfile;
  private getDecoratedProfileUC: GetDecoratedProfile;

  constructor(useCases: ProfileControllerUseCases) {
    this.saveAcademicProfileUC = useCases.saveAcademicProfile;
    this.getDecoratedProfileUC = useCases.getDecoratedProfile;
  }

  public getProfile = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = UserSchemas.StudentIdParamSchema.parse(req.params);
    const profile = await this.getDecoratedProfileUC.execute(studentId, 'base');
    res.status(200).json(profile);
  });

  public getDecoratedProfile = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = UserSchemas.StudentIdParamSchema.parse(req.params);
    const { vista } = UserSchemas.GetDecoratedProfileQuerySchema.parse(req.query);
    const profile = await this.getDecoratedProfileUC.execute(studentId, vista || 'base');
    res.status(200).json(profile);
  });

  public upsertProfile = asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = UserSchemas.SaveAcademicProfileRequestSchema.parse(req.body);

    // "Ley de Hierro" validation using UserSchema
    const payloadToValidate = {
      uid: validatedBody.studentId,
      ...validatedBody
    };
    UserSchemas.UserSchema.partial().parse(payloadToValidate);

    const result = await this.saveAcademicProfileUC.execute(validatedBody);
    res.status(200).json(result);
  });
}

