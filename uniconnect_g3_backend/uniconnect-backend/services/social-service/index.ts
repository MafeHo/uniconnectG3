import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import DatabaseFactory from './src/config/databaseFactory';
const db = DatabaseFactory.getDatabase();

// Repositorios
import { FirestoreGroupRepository } from './src/infrastructure/database/FirestoreGroupRepository';
import { FirestoreGroupMemberRepository } from './src/infrastructure/database/FirestoreGroupMemberRepository';
import { FirestoreGroupRequestRepository } from './src/infrastructure/database/FirestoreGroupRequestRepository';
import { FirestoreEventRepository } from './src/infrastructure/database/FirestoreEventRepository';
import { FirestoreCategoryRepository } from './src/infrastructure/database/FirestoreCategoryRepository';
import { FirestoreEventSubscriptionRepository } from './src/infrastructure/database/FirestoreEventSubscriptionRepository';
import { FirestoreUserRepository } from './src/infrastructure/database/FirestoreUserRepository';
import { FirestoreAcademicCatalogRepository } from './src/infrastructure/database/FirestoreAcademicCatalogRepository';

const groupRepo = new FirestoreGroupRepository(db);
const groupMemberRepo = new FirestoreGroupMemberRepository(db);
const groupRequestRepo = new FirestoreGroupRequestRepository(db);
const eventRepo = new FirestoreEventRepository(db);
const categoryRepo = new FirestoreCategoryRepository(db);
const subscriptionRepo = new FirestoreEventSubscriptionRepository(db);
const userRepo = new FirestoreUserRepository(db);
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

// --- INFRAESTRUCTURA OBSERVER ---
import studyGroupSubject from './src/application/observer/GrupoEstudioSubject';
import eventoUniversidadSubject from './src/application/observer/EventoUniversidadSubject';
import PersistenciaNotificacionObserver from './src/infrastructure/observers/PersistenciaNotificacionObserver';
import WebSocketNotificationObserver from './src/infrastructure/observers/WebSocketNotificationObserver';
import PushNotificationObserver from './src/infrastructure/observers/PushNotificationObserver';
import EventoUniversidadObserver from './src/infrastructure/observers/EventoUniversidadObserver';

// Setup Express y HTTP Server para Sockets
const app: express.Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Inicializar y Registrar Observers
const persistenceObserver = new PersistenciaNotificacionObserver(db);
const wsObserver = new WebSocketNotificationObserver(io);
const pushObserver = new PushNotificationObserver(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006');

studyGroupSubject.attach(persistenceObserver);
studyGroupSubject.attach(wsObserver);
studyGroupSubject.attach(pushObserver);

const eventoObserver = new EventoUniversidadObserver(io, db, subscriptionRepo, categoryRepo);
eventoUniversidadSubject.attach(eventoObserver);

console.log('✅ Sistema de Notificaciones (Observer) inicializado y registrado.');

// Configuración Socket.io para usuarios
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && typeof userId === 'string') {
    socket.join(userId);
    console.log(`[Socket] Usuario ${userId} conectado y suscrito a su canal personal.`);
  }

  socket.on('disconnect', () => {
    console.log('[Socket] Cliente desconectado.');
  });
});

// Casos de Uso
import { CreateGroup } from './src/application/use-cases/group/createGroup';
import { GetUserGroups } from './src/application/use-cases/group/getUserGroups';
import { GetGroupById } from './src/application/use-cases/group/getGroupById';
import { SearchGroups } from './src/application/use-cases/group/searchGroups';
import { CheckGroupNameUnique } from './src/application/use-cases/group/checkGroupNameUnique';
import { SendJoinRequest } from './src/application/use-cases/group/sendJoinRequest';
import { GetGroupRequests } from './src/application/use-cases/group/getGroupRequests';
import { HandleRequestAction } from './src/application/use-cases/group/handleRequestAction';
import { RemoveMember } from './src/application/use-cases/group/removeMember';
import { TransferAdmin } from './src/application/use-cases/group/transferAdmin';
import { AddMember } from './src/application/use-cases/group/addMember';
import { LeaveGroup } from './src/application/use-cases/group/leaveGroup';
import { GetAvailableStudents } from './src/application/use-cases/group/getAvailableStudents';
import { DeleteUserRequests } from './src/application/use-cases/group/deleteUserRequests';
import { RequestAdminTransfer } from './src/application/use-cases/group/requestAdminTransfer';
import { HandleAdminTransferResponse } from './src/application/use-cases/group/handleAdminTransferResponse';
import { GetEvents } from './src/application/use-cases/event/getEvents';
import { CreateEvent } from './src/application/use-cases/event/CreateEvent';
import { GetCategories } from './src/application/use-cases/event/GetCategories';
import { SubscribeToCategory } from './src/application/use-cases/event/SubscribeToCategory';
import { UnsubscribeFromCategory } from './src/application/use-cases/event/UnsubscribeFromCategory';
import { GetSubscribedCategories } from './src/application/use-cases/event/GetSubscribedCategories';

const createGroupUC = new CreateGroup(groupRepo, groupMemberRepo);
const getUserGroupsUC = new GetUserGroups(groupMemberRepo, groupRepo, catalogRepo, userRepo);
const getGroupByIdUC = new GetGroupById(groupRepo, groupMemberRepo, groupRequestRepo, catalogRepo, userRepo);
const searchGroupsUC = new SearchGroups(groupRepo, groupMemberRepo, groupRequestRepo, catalogRepo, userRepo);
const checkGroupNameUniqueUC = new CheckGroupNameUnique(groupRepo);
const sendJoinRequestUC = new SendJoinRequest(groupRepo, groupMemberRepo, groupRequestRepo, studyGroupSubject);
const getGroupRequestsUC = new GetGroupRequests(groupRequestRepo);
const handleRequestActionUC = new HandleRequestAction(groupMemberRepo, groupRequestRepo, groupRepo, studyGroupSubject);
const removeMemberUC = new RemoveMember(groupMemberRepo);
const transferAdminUC = new TransferAdmin(groupMemberRepo, db, studyGroupSubject);
const addMemberUC = new AddMember(groupMemberRepo);
const leaveGroupUC = new LeaveGroup(groupMemberRepo, groupRepo);
const getAvailableStudentsUC = new GetAvailableStudents(groupMemberRepo, userRepo);
const deleteUserRequestsUC = new DeleteUserRequests(groupRequestRepo);
const requestAdminTransferUC = new RequestAdminTransfer(groupRepo, groupMemberRepo, userRepo, studyGroupSubject);
const handleAdminTransferResponseUC = new HandleAdminTransferResponse(groupRepo, groupMemberRepo, db, studyGroupSubject);
const getEventsUC = new GetEvents(eventRepo, categoryRepo);
const createEventUC = new CreateEvent(eventRepo, eventoUniversidadSubject);
const getCategoriesUC = new GetCategories(categoryRepo);
const subscribeToCategoryUC = new SubscribeToCategory(subscriptionRepo);
const unsubscribeFromCategoryUC = new UnsubscribeFromCategory(subscriptionRepo);
const getSubscribedCategoriesUC = new GetSubscribedCategories(subscriptionRepo);

// Controladores
import { GroupController } from './src/infrastructure/http/controllers/groupController';
import { EventController } from './src/infrastructure/http/controllers/eventController';

const groupCtrl = new GroupController({
  createGroup: createGroupUC,
  getUserGroups: getUserGroupsUC,
  getGroupById: getGroupByIdUC,
  searchGroups: searchGroupsUC,
  checkGroupNameUnique: checkGroupNameUniqueUC,
  sendJoinRequest: sendJoinRequestUC,
  getGroupRequests: getGroupRequestsUC,
  handleRequestAction: handleRequestActionUC,
  removeMember: removeMemberUC,
  transferAdmin: transferAdminUC,
  addMember: addMemberUC,
  leaveGroup: leaveGroupUC,
  getAvailableStudents: getAvailableStudentsUC,
  deleteUserRequests: deleteUserRequestsUC,
  requestAdminTransfer: requestAdminTransferUC,
  handleAdminTransferResponse: handleAdminTransferResponseUC
});

const eventCtrl = new EventController({
  getEvents: getEventsUC,
  createEvent: createEventUC,
  getCategories: getCategoriesUC,
  subscribeToCategory: subscribeToCategoryUC,
  unsubscribeFromCategory: unsubscribeFromCategoryUC,
  getSubscribedCategories: getSubscribedCategoriesUC
});

import { createGroupRoutes } from './src/infrastructure/http/routes/groupRoutes';
import { createEventRoutes } from './src/infrastructure/http/routes/eventRoutes';

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'social-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/groups', createGroupRoutes(groupCtrl));
app.use('/events', createEventRoutes(eventCtrl));

import { globalErrorHandler } from './src/infrastructure/http/middlewares/errorMiddleware';
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3003;
  server.listen(PORT, () => {
    console.log(`👥 Social Service (Grupos y Eventos) listo en puerto ${PORT}`);
  });
}

(app as any).server = server;
export default app;
// Compatibilidad CommonJS para tests con require()
if (typeof module !== 'undefined') (module as any).exports = app;
