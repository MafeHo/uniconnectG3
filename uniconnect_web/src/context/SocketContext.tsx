import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { authStore } from '@uniconnect/shared';
import { useMyPresence } from '../hooks/usePresence';

interface SocketContextType {
  notifSocket: Socket | null; // social-service:3003 → notificaciones
  chatSocket: Socket | null;  // chat-service:3004 → salas de grupos
}

const SocketContext = createContext<SocketContextType>({
  notifSocket: null,
  chatSocket: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const notifSocketRef = useRef<Socket | null>(null);
  const chatSocketRef = useRef<Socket | null>(null);
  const { user } = authStore();

  useEffect(() => {
    if (!user?.uid) return;

    // Socket 1: social-service → notificaciones en tiempo real
    const notifSocket = io('http://localhost:3003', {
      transports: ['polling', 'websocket'],
      query: { userId: user.uid },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    notifSocket.on('connect', () => console.log('[NotifSocket] Conectado al social-service'));
    notifSocket.on('connect_error', (err) => console.warn('[NotifSocket] Error:', err.message));

    // Socket 2: chat-service → salas de grupos
    const chatSocket = io('http://localhost:3004', {
      transports: ['polling', 'websocket'],
      query: { userId: user.uid },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    chatSocket.on('connect', () => console.log('[ChatSocket] Conectado al chat-service'));
    chatSocket.on('connect_error', (err) => console.warn('[ChatSocket] Error:', err.message));

    notifSocketRef.current = notifSocket;
    chatSocketRef.current = chatSocket;

    return () => {
      notifSocket.disconnect();
      chatSocket.disconnect();
    };
  }, [user?.uid]);

  // Presencia gestionada automáticamente por el backend al conectar/desconectar el chatSocket
  useMyPresence();

  return (
    <SocketContext.Provider value={{ notifSocket: notifSocketRef.current, chatSocket: chatSocketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useNotifSocket = () => useContext(SocketContext).notifSocket;
export const useChatSocket = () => useContext(SocketContext).chatSocket;
// Keep backward compat for any existing useSocket consumers
export const useSocket = () => useContext(SocketContext).chatSocket;
