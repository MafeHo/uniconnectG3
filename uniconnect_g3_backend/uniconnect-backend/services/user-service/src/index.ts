import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { db } from './config/firestore';

import FirestoreUserRepository from './infrastructure/database/FirestoreUserRepository';
import FirestoreAcademicProfileRepository from './infrastructure/database/FirestoreAcademicProfileRepository';
import FirestoreAcademicCatalogRepository from './infrastructure/database/FirestoreAcademicCatalogRepository';
import FirestoreStatsRepository from './infrastructure/database/FirestoreStatsRepository';

const userRepo = new FirestoreUserRepository(db);
const academicProfileRepo = new FirestoreAcademicProfileRepository(db);
const catalogRepo = new FirestoreAcademicCatalogRepository(db);
const statsRepo = new FirestoreStatsRepository(db);

import GetFullProfile from './application/use-cases/getFullProfile';
import SaveAcademicProfile from './application/use-cases/saveAcademicProfile';
import SearchStudents from './application/use-cases/searchStudents';
import GetDecoratedProfile from './application/use-cases/getDecoratedProfile';

const getFullProfileUC = new GetFullProfile(academicProfileRepo, userRepo, catalogRepo);
const saveAcademicProfileUC = new SaveAcademicProfile(academicProfileRepo, userRepo, catalogRepo, getFullProfileUC);
const searchStudentsUC = new SearchStudents(academicProfileRepo, userRepo);
const getDecoratedProfileUC = new GetDecoratedProfile(getFullProfileUC, statsRepo);

import ProfileController from './infrastructure/http/controllers/profileController';
import SearchController from './infrastructure/http/controllers/searchController';

const profileCtrl = new ProfileController({
  getFullProfile: getFullProfileUC,
  saveAcademicProfile: saveAcademicProfileUC,
  getDecoratedProfile: getDecoratedProfileUC
});

const searchCtrl = new SearchController({
  searchStudents: searchStudentsUC
});

import createProfileRoutes from './infrastructure/http/routes/profileRoutes';
import createSearchRoutes from './infrastructure/http/routes/searchRoutes';
import { globalErrorHandler } from './infrastructure/http/middlewares/errorMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/profile', createProfileRoutes(profileCtrl));
app.use('/search', createSearchRoutes(searchCtrl));

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`👤 User Service ejecutándose en puerto ${PORT}`);
});
