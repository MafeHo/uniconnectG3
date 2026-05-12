import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { authStore } from '@uniconnect/shared';

// Singleton socket al chat-service (puerto 3004)
let chatSocket: Socket | null = null;

export const useChatSocket = () => {
  const user = authStore((state) => state.user);

  useEffect(() => {
    if (!user?.uid) {
      if (chatSocket) {
        chatSocket.disconnect();
        chatSocket = null;
      }
      return;
    }

    if (!chatSocket) {
      // EXPO_PUBLIC_CHAT_URL apunta directamente al chat-service (3004)
      // Fallback: reemplaza el puerto del gateway por 3004
      const chatUrl =
        process.env.EXPO_PUBLIC_CHAT_URL ||
        (process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/:\d+$/, ':3004');

      chatSocket = io(chatUrl, {
        query: { userId: user.uid },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      chatSocket.on('connect', () => console.log('[ChatSocket] Conectado al chat-service'));
      chatSocket.on('disconnect', () => console.log('[ChatSocket] Desconectado del chat-service'));
    }
  }, [user?.uid]);

  return chatSocket;
};
