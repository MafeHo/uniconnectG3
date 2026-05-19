import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { GetAllFaculties } from '../../../application/use-cases/getAllFaculties';
import { GetAcademicLevelsByFaculty } from '../../../application/use-cases/getAcademicLevelsByFaculty';
import { GetFormationLevels } from '../../../application/use-cases/getFormationLevels';
import { GetCareersByPath } from '../../../application/use-cases/getCareersByPath';
import { GetAllCareers } from '../../../application/use-cases/getAllCareers';
import { GetAllSubjects } from '../../../application/use-cases/getAllSubjects';
import { GetCareerStructure } from '../../../application/use-cases/getCareerStructure';
import { AcademicSchemas } from '@uniconnect/api-types';

interface AcademicUseCases {
  getAllFaculties: GetAllFaculties;
  getAcademicLevelsByFaculty: GetAcademicLevelsByFaculty;
  getFormationLevels: GetFormationLevels;
  getCareersByPath: GetCareersByPath;
  getAllCareers: GetAllCareers;
  getAllSubjects: GetAllSubjects;
  getCareerStructure: GetCareerStructure;
}

export class AcademicController {
  private getAllFacultiesUC: GetAllFaculties;
  private getAcademicLevelsByFacultyUC: GetAcademicLevelsByFaculty;
  private getFormationLevelsUC: GetFormationLevels;
  private getCareersByPathUC: GetCareersByPath;
  private getAllCareersUC: GetAllCareers;
  private getAllSubjectsUC: GetAllSubjects;
  private getCareerStructureUC: GetCareerStructure;

  constructor(useCases: AcademicUseCases) {
    this.getAllFacultiesUC = useCases.getAllFaculties;
    this.getAcademicLevelsByFacultyUC = useCases.getAcademicLevelsByFaculty;
    this.getFormationLevelsUC = useCases.getFormationLevels;
    this.getCareersByPathUC = useCases.getCareersByPath;
    this.getAllCareersUC = useCases.getAllCareers;
    this.getAllSubjectsUC = useCases.getAllSubjects;
    this.getCareerStructureUC = useCases.getCareerStructure;
  }

  getAllFaculties = asyncHandler(async (_req: Request, res: Response) => {
    const faculties = await this.getAllFacultiesUC.execute();
    res.json(faculties);
  });

  getAcademicLevelsByFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { facultyId } = AcademicSchemas.FacultyIdParamSchema.parse(req.params);
    const levels = await this.getAcademicLevelsByFacultyUC.execute(facultyId);
    res.json(levels);
  });

  getFormationLevels = asyncHandler(async (req: Request, res: Response) => {
    const { facultyId, academicLevelId } = AcademicSchemas.GetFormationLevelsParamsSchema.parse(req.params);
    const levels = await this.getFormationLevelsUC.execute(facultyId, academicLevelId);
    res.json(levels);
  });

  getCareersByPath = asyncHandler(async (req: Request, res: Response) => {
    const { facultyId, academicLevelId, formationLevelId } = AcademicSchemas.GetCareersByPathParamsSchema.parse(req.params);
    const careers = await this.getCareersByPathUC.execute(
      facultyId,
      academicLevelId,
      formationLevelId
    );
    res.json(careers);
  });

  getAllCareers = asyncHandler(async (_req: Request, res: Response) => {
    const careers = await this.getAllCareersUC.execute();
    if (careers.length === 0) {
      throw new Error("No se encontraron carreras");
    }
    res.status(200).json(careers);
  });

  getAllSubjects = asyncHandler(async (_req: Request, res: Response) => {
    const subjects = await this.getAllSubjectsUC.execute();
    res.json(subjects);
  });

  getCareerStructure = asyncHandler(async (req: Request, res: Response) => {
    const { careerId } = AcademicSchemas.CareerIdParamSchema.parse(req.params);
    const structure = await this.getCareerStructureUC.execute(careerId);
    res.status(200).json(structure);
  });
}

