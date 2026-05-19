import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { db } from './src/config/firestore';

// Infrastructure
import { CloudinaryService } from './src/infrastructure/external/CloudinaryService';
import { FirestoreChatRepository } from './src/infrastructure/database/FirestoreChatRepository';
import { FirestoreMessageRepository } from './src/infrastructure/database/FirestoreMessageRepository';
import { FirestoreGroupMessageRepository } from './src/infrastructure/database/FirestoreGroupMessageRepository';
import { FirestoreGroupMemberRepository } from './src/infrastructure/database/FirestoreGroupMemberRepository';

// Use Cases
import { GetOrCreateChat } from './src/application/use-cases/getOrCreateChat';
import { SendMessage } from './src/application/use-cases/sendMessage';
import { SendFileMessage } from './src/application/use-cases/sendFileMessage';
import { GetMessages } from './src/application/use-cases/getMessages';
import { SendGroupMessage } from './src/application/use-cases/sendGroupMessage';
import { AddReaction } from './src/application/use-cases/addReaction';
import { AddGroupReaction } from './src/application/use-cases/addGroupReaction';

// Observer Pattern
import chatSubject from './src/application/observer/ChatSubject';
import { GroupChatObserver } from './src/infrastructure/observers/GroupChatObserver';
import { MentionNotificationObserver } from './src/infrastructure/observers/MentionNotificationObserver';

// Controllers
import { ChatController } from './src/infrastructure/http/controllers/chatController';
import { GroupChatController } from './src/infrastructure/http/controllers/groupChatController';

// Routes
import createChatRoutes from './src/infrastructure/http/routes/chatRoutes';
import createGroupChatRoutes from './src/infrastructure/http/routes/groupChatRoutes';

const cloudinaryService = new CloudinaryService({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

const chatRepo = new FirestoreChatRepository(db);
const messageRepo = new FirestoreMessageRepository(db);
const groupMessageRepo = new FirestoreGroupMessageRepository(db);
const groupMemberRepo = new FirestoreGroupMemberRepository(db);

// --- SOCKET HELPER ---
const socketService = {
  emitToChat: (chatId: string, event: string, data: unknown) => io.to(chatId).emit(event, data),
  emitToGroup: (groupId: string, event: string, data: unknown) => io.to(groupId).emit(event, data),
};

const getOrCreateChatUC = new GetOrCreateChat(chatRepo);
const sendMessageUC = new SendMessage(messageRepo, chatRepo);
const sendFileMessageUC = new SendFileMessage(cloudinaryService, sendMessageUC);
const getMessagesUC = new GetMessages(messageRepo);
const sendGroupMessageUC = new SendGroupMessage(groupMessageRepo, groupMemberRepo, cloudinaryService);
const addReactionUC = new AddReaction(messageRepo, socketService);
const addGroupReactionUC = new AddGroupReaction(groupMessageRepo, socketService);

const chatCtrl = new ChatController({
  getOrCreateChat: getOrCreateChatUC,
  sendMessage: sendMessageUC,
  sendFileMessage: sendFileMessageUC,
  getMessages: getMessagesUC,
  addReaction: addReactionUC
});

const groupChatCtrl = new GroupChatController({
  sendGroupMessage: sendGroupMessageUC,
  addGroupReaction: addGroupReactionUC
});

// Setup Express
const app: express.Application = express();
app.use(cors());
app.use(express.json());

// Ruta de salud para Fly.io
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createChatRoutes(chatCtrl));
app.use('/groups', createGroupChatRoutes(groupChatCtrl));

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Registrar Observadores (Tarea 3)
const groupChatObserver = new GroupChatObserver(io);
chatSubject.attach(groupChatObserver);

// US-M03: Puente con NotificationService para Menciones
const mentionObserver = new MentionNotificationObserver(db);
chatSubject.attach(mentionObserver);

// --- PRESENCE TRACKER ---
const activeUsers = new Map<string, string>();

// --- HELPERS ---
interface RawMessageDTO {
  id?: string;
  messageId?: string;
  createdAt?: { toDate?: () => Date } | Date | null;
  senderId?: string;
  text?: string;
  content?: string;
  renderedContent?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

const formatMessageDTO = (msg: RawMessageDTO) => {
  const id = msg.id || msg.messageId || `temp_${Date.now()}`;
  const createdAt = msg.createdAt;

  const timestamp = (createdAt && typeof (createdAt as { toDate?: () => Date }).toDate === 'function')
    ? (createdAt as { toDate: () => Date }).toDate().toISOString()
    : (createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString());

  return {
    message_id: id,
    timestamp,
    sender: { id: msg.senderId },
    content: msg.text || msg.content,
    renderedContent: msg.renderedContent,
    metadata: msg.metadata || msg
  };
};

const formatErrorDTO = (error: Error & { codigo?: string; detalles?: string }) => ({
  error: true,
  codigo: error.codigo || 'INTERNAL_ERROR',
  mensaje: error.message || 'Ha ocurrido un error inesperado',
  detalles: error.detalles || (error.codigo === 'MESSAGE_TOO_LONG' ? 'Máximo 2000 caracteres' : null),
  timestamp: new Date().toISOString()
});

io.on('connection', async (socket: Socket) => {
  const { userId, study_group_id } = socket.handshake.query as { userId?: string; study_group_id?: string };

  console.log(`[Socket] Nuevo intento de conexión. Usuario: ${userId}, Grupo Inicial: ${study_group_id}`);

  if (!userId) {
    console.error('[Socket] Falta userId en la conexión');
    return socket.disconnect();
  }

  (socket as Socket & { userId?: string }).userId = userId;

  // 1. PRESENCIA SEGMENTADA POR GRUPOS (US-W06 C5)
  activeUsers.set(userId, socket.id);
  socket.join(`user_${userId}`);

  // Notificar solo a los grupos del usuario
  try {
    const groupIds = await groupMemberRepo.getGroupsByUserId(userId);
    groupIds.forEach(gid => {
      io.to(gid).emit('USER_STATUS_CHANGED', { userId, status: 'online' });
    });
    console.log(`[Socket] Presencia segmentada: Notificado online a ${groupIds.length} grupos.`);
  } catch (err) {
    console.error("[Socket] Error notificando presencia segmentada:", err);
    io.emit('USER_STATUS_CHANGED', { userId, status: 'online' });
  }

  // 1b. PRESENCIA 1 A 1 (DIFUSIÓN PROACTIVA)
  try {
    const chats = await chatRepo.findByUserId(userId);
    chats.forEach(chat => {
      const otherId = (chat.participants as string[]).find(p => p !== userId);
      if (otherId && activeUsers.has(otherId)) {
        io.to(`user_${otherId}`).emit('USER_STATUS_CHANGED', { userId, status: 'online' });
      }
    });
    console.log(`[Socket] Presencia 1 a 1: Notificado online a ${chats.length} contactos.`);
  } catch (err) {
    console.error("[Socket] Error notificando presencia 1 a 1:", err);
  }

  // Evento para consultar el estado de un usuario específico
  socket.on('check_user_status', ({ userId: targetUserId }: { userId: string }, callback: (res: { userId: string; status: 'online' | 'offline' }) => void) => {
    const isOnline = activeUsers.has(targetUserId);
    if (callback) callback({ userId: targetUserId, status: isOnline ? 'online' : 'offline' });
  });

  // Si viene con un grupo en el handshake, lo unimos
  if (study_group_id) {
    try {
      const isMember = await groupMemberRepo.isMember(study_group_id, userId);
      if (isMember) {
        socket.join(study_group_id);
        console.log(`[Socket] Usuario ${userId} unido a la sala (handshake): ${study_group_id}`);
      }
    } catch (err) {
      console.error("[Socket] Error uniendo a sala inicial:", err);
    }
  }

  // Listener para unirse a grupos dinámicamente (Requerido para el frontend)
  socket.on('join_group', async ({ groupId, userId: eventUserId }: { groupId: string; userId?: string }) => {
    const uid = eventUserId || (socket as Socket & { userId?: string }).userId || userId;
    console.log(`[Socket] Solicitud join_group: Usuario ${uid} -> Grupo ${groupId}`);

    try {
      const isMember = await groupMemberRepo.isMember(groupId, uid);
      if (isMember) {
        socket.join(groupId);
        console.log(`[Socket] Usuario ${uid} unido con éxito a la sala: ${groupId}`);
      } else {
        console.warn(`[Socket] Acceso denegado: ${uid} no es miembro de ${groupId}`);
      }
    } catch (error) {
      console.error("[Socket] Error en join_group:", error);
    }
  });

  socket.on('leave_group', ({ groupId }: { groupId: string }) => {
    socket.leave(groupId);
    console.log(`[Socket] Usuario ${(socket as Socket & { userId?: string }).userId || userId} salió de la sala: ${groupId}`);
  });

  // --- MENCIONES DINÁMICAS (C4) ---
  socket.on('get_mention_suggestions', async ({ groupId, query }: { groupId: string; query?: string }, callback: (res: { success: boolean; data?: unknown[]; error?: string }) => void) => {
    try {
      let members = await groupMemberRepo.getGroupMembersWithNames(groupId);

      if (query) {
        const q = query.toLowerCase();
        members = members.filter(m =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.id && m.id.toLowerCase().includes(q))
        );
      } else {
        members = members.slice(0, 15);
      }

      if (callback) callback({ success: true, data: members });
    } catch (error) {
      console.error("[Socket] Error obteniendo miembros para menciones:", error);
      if (callback) callback({ success: false, error: 'Error obteniendo miembros' });
    }
  });

  // --- CHAT PRIVADO (US-W06 C2) ---
  socket.on('join_private_chat', ({ chatId }: { chatId: string }) => {
    const roomName = `room_private_${chatId}`;
    socket.join(roomName);
    console.log(`[Socket] Usuario ${(socket as Socket & { userId?: string }).userId || userId} unido al chat privado: ${roomName}`);
  });

  // Endpoint de "Snapshot" de Cabecera de Chat (Tarea 4)
  socket.on('get_chat_header_info', async ({ chatId, userId }: { chatId: string; userId: string }, callback: (res: { success: boolean; error?: string; data?: { name: string; photoUrl: string | null; status: 'online' | 'offline' } }) => void) => {
    try {
      const chat = await chatRepo.findById(chatId);
      if (!chat || !chat.participants) {
        return callback({ success: false, error: 'Chat no encontrado' });
      }

      const otherId = (chat.participants as string[]).find(p => p !== userId);
      if (!otherId) {
        return callback({ success: false, error: 'Participante no encontrado' });
      }

      const userDoc = await db.collection('users').doc(otherId).get();
      const userData = userDoc.exists ? userDoc.data() || {} : {};

      if (callback) callback({
        success: true,
        data: {
          name: userData.name || userData.displayName || 'Compañero',
          photoUrl: userData.photoUrl || userData.avatar || null,
          status: activeUsers.has(otherId) ? 'online' : 'offline'
        }
      });
    } catch (err) {
      console.error("[Socket] Error en get_chat_header_info:", err);
      if (callback) callback({ success: false, error: 'Error interno' });
    }
  });

  socket.on('send_private_message', async (rawPayload: unknown, callback: (res: { success: boolean; [key: string]: unknown }) => void) => {
    let payload = rawPayload;
    if (typeof rawPayload === 'string') {
      try { payload = JSON.parse(rawPayload); } catch (e) { }
    }

    const typedPayload = payload as { chatId?: string; senderId?: string; receiverId?: string; text?: string; file?: { url: string; name: string } } | null;
    const { chatId, senderId, receiverId, text, file } = typedPayload || {};

    if (!chatId || !senderId || (!text && !file)) {
      if (callback) callback({ success: false, error: 'Campos requeridos faltantes para chat privado' });
      return;
    }

    try {
      const messageData = file ? { type: 'file', fileUrl: file.url, fileName: file.name, text } : { type: 'text', text };
      const result = await sendMessageUC.execute(chatId, senderId, messageData);

      const responseData = formatMessageDTO(result);

      socketService.emitToChat(`room_private_${chatId}`, 'receive_private_message', responseData);
      socketService.emitToChat(`user_${senderId}`, 'receive_private_message', responseData);

      if (receiverId) {
        socketService.emitToChat(`user_${receiverId}`, 'receive_private_message', responseData);
      }

      if (callback) callback({ success: true, data: responseData });
    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_private_message:', error);

      const errorDTO = formatErrorDTO(error as Error & { codigo?: string; detalles?: string });
      socket.emit('error_message', errorDTO);

      if (callback) callback({ success: false, ...errorDTO });
    }
  });

  socket.on('get_private_history', async ({ chatId, limit = 20, lastMessageId }: { chatId: string; limit?: number; lastMessageId?: string | null }, callback: (res: { success?: boolean; error?: string; messages?: unknown[]; lastMessageId?: string | null; hasMore?: boolean }) => void) => {
    if (!chatId) {
      if (callback) callback({ success: false, error: 'chatId es requerido' });
      return;
    }
    try {
      const messages = await messageRepo.findWithPagination(chatId, limit, lastMessageId || null);
      const formattedMessages = messages.map(formatMessageDTO);
      const newLastId = formattedMessages.length > 0 ? formattedMessages[0].message_id : null;
      const hasMore = messages.length === limit;

      if (callback) callback({
        messages: formattedMessages,
        lastMessageId: newLastId,
        hasMore
      });
    } catch (error) {
      console.error("[Socket Debug] ❌ Error obteniendo historial privado:", error);
      if (callback) callback({ success: false, error: 'Error al obtener historial' });
    }
  });

  socket.on('get_messages_since', async ({ chatId, timestamp }: { chatId: string; timestamp: string | Date }, callback: (res: unknown[]) => void) => {
    if (!chatId || !timestamp) {
      if (callback) callback([]);
      return;
    }
    try {
      const messages = await messageRepo.getMessagesSince(chatId, timestamp);
      const formattedMessages = messages.map(formatMessageDTO);
      if (callback) callback(formattedMessages);
    } catch (error) {
      console.error("[Socket Debug] ❌ Error obteniendo messages desde timestamp:", error);
      if (callback) callback([]);
    }
  });

  // --- HISTORIAL GRUPAL ---
  socket.on('get_group_history', async ({ groupId, limit = 20, lastMessageId }: { groupId: string; limit?: number; lastMessageId?: string | null }, callback: (res: { success?: boolean; error?: string; messages?: unknown[]; lastMessageId?: string | null; hasMore?: boolean }) => void) => {
    if (!groupId) {
      if (callback) callback({ success: false, error: 'groupId es requerido' });
      return;
    }
    try {
      const messages = await groupMessageRepo.findWithPagination(groupId, limit, lastMessageId || null);
      const formattedMessages = messages.map(formatMessageDTO);
      const newLastId = formattedMessages.length > 0 ? formattedMessages[0].message_id : null;
      const hasMore = messages.length === limit;

      if (callback) callback({
        messages: formattedMessages,
        lastMessageId: newLastId,
        hasMore
      });
    } catch (error) {
      console.error("[Socket Debug] ❌ Error historial grupal:", error);
      if (callback) callback({ success: false, error: 'Error al obtener historial' });
    }
  });

  socket.on('get_group_messages_since', async ({ groupId, timestamp }: { groupId: string; timestamp: string | Date }, callback: (res: unknown[]) => void) => {
    if (!groupId || !timestamp) {
      if (callback) callback([]);
      return;
    }
    try {
      const messages = await groupMessageRepo.getMessagesSince(groupId, timestamp);
      const formattedMessages = messages.map(formatMessageDTO);
      if (callback) callback(formattedMessages);
    } catch (error) {
      console.error("[Socket Debug] ❌ Error delta sync grupal:", error);
      if (callback) callback([]);
    }
  });

  // --- ESCUCHAR MENSAJES (GRUPAL) ---
  socket.on('send_message', async (rawPayload: unknown, callback: (res: { success: boolean; [key: string]: unknown }) => void) => {
    let payload = rawPayload;

    if (typeof rawPayload === 'string') {
      try {
        payload = JSON.parse(rawPayload);
      } catch (e) {
        console.error("[Socket Debug] Error parseando payload string:", e);
      }
    }

    const typedPayload = payload as { sender_id?: string; group_id?: string; content?: string } | null;
    const { sender_id, group_id, content } = typedPayload || {};
    console.log(`[Socket Debug] 1. Payload procesado: sender=${sender_id}, group=${group_id}`);

    if (!sender_id || !group_id || !content) {
      console.log(`[Socket Debug] Error: Campos faltantes en payload`);
      if (callback) callback({ success: false, error: 'Campos requeridos faltantes' });
      return;
    }

    try {
      console.log(`[Socket Debug] 2. Llamando a sendGroupMessageUC.execute...`);

      const result = await sendGroupMessageUC.execute(group_id, sender_id, { text: content });

      console.log(`[Socket Debug] 3. Persistencia exitosa, ID: ${result.messageId}`);

      const responseData = formatMessageDTO(result);

      socketService.emitToChat(`user_${sender_id}`, 'receive_message', responseData);

      if (callback) {
        console.log(`[Socket Debug] 4. Enviando callback de éxito al cliente`);
        callback({ success: true, data: responseData });
      }

    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_message:', error);
      const errorDTO = formatErrorDTO(error as Error & { codigo?: string; detalles?: string });
      socket.emit('error_message', errorDTO);
      if (callback) callback({ success: false, ...errorDTO });
    }
  });

  socket.on('disconnect', async () => {
    console.log(`[Socket] Usuario ${userId} desconectado`);
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);

      try {
        const groupIds = await groupMemberRepo.getGroupsByUserId(userId);
        groupIds.forEach(gid => {
          io.to(gid).emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
        });
        console.log(`[Socket] Presencia segmentada: Notificado offline a ${groupIds.length} grupos.`);
      } catch (err) {
        console.error("[Socket] Error notificando offline segmentado:", err);
        io.emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
      }

      // 2b. PRESENCIA 1 A 1 (OFFLINE)
      try {
        const chats = await chatRepo.findByUserId(userId);
        chats.forEach(chat => {
          const otherId = (chat.participants as string[]).find(p => p !== userId);
          if (otherId && activeUsers.has(otherId)) {
            io.to(`user_${otherId}`).emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
          }
        });
        console.log(`[Socket] Presencia 1 a 1: Notificado offline a ${chats.length} contactos.`);
      } catch (err) {
        console.error("[Socket] Error notificando offline 1 a 1:", err);
      }
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Observer Pattern & Socket.io activo)`);
});

export default app;
