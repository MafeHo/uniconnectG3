import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './src/config/firestore';

import { FirestoreAcademicCatalogRepository } from './src/infrastructure/database/FirestoreAcademicCatalogRepository';
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

import { GetAllFaculties } from './src/application/use-cases/getAllFaculties';
import { GetAcademicLevelsByFaculty } from './src/application/use-cases/getAcademicLevelsByFaculty';
import { GetFormationLevels } from './src/application/use-cases/getFormationLevels';
import { GetCareersByPath } from './src/application/use-cases/getCareersByPath';
import { GetAllCareers } from './src/application/use-cases/getAllCareers';
import { GetAllSubjects } from './src/application/use-cases/getAllSubjects';
import { GetCareerStructure } from './src/application/use-cases/getCareerStructure';

const getAllFacultiesUC = new GetAllFaculties(catalogRepo);
const getAcademicLevelsByFacultyUC = new GetAcademicLevelsByFaculty(catalogRepo);
const getFormationLevelsUC = new GetFormationLevels(catalogRepo);
const getCareersByPathUC = new GetCareersByPath(catalogRepo);
const getAllCareersUC = new GetAllCareers(catalogRepo);
const getAllSubjectsUC = new GetAllSubjects(catalogRepo);
const getCareerStructureUC = new GetCareerStructure(catalogRepo);

import { AcademicController } from './src/infrastructure/http/controllers/academicController';
const academicCtrl = new AcademicController({
  getAllFaculties: getAllFacultiesUC,
  getAcademicLevelsByFaculty: getAcademicLevelsByFacultyUC,
  getFormationLevels: getFormationLevelsUC,
  getCareersByPath: getCareersByPathUC,
  getAllCareers: getAllCareersUC,
  getAllSubjects: getAllSubjectsUC,
  getCareerStructure: getCareerStructureUC
});

import { createAcademicRoutes } from './src/infrastructure/http/routes/academicRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'academic-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createAcademicRoutes(academicCtrl));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🎓 Academic Service (Catálogos) listo en puerto ${PORT}`);
});
