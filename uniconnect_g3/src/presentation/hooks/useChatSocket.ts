import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authStore } from '@uniconnect/shared';

// Singleton de instancia (evita múltiples conexiones)
let _socket: Socket | null = null;
// Suscriptores para notificar cuando el socket conecta
const _listeners = new Set<(s: Socket | null) => void>();

const notifyListeners = (s: Socket | null) => _listeners.forEach(fn => fn(s));

export const useChatSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(_socket?.connected ? _socket : null);

  useEffect(() => {
    const listener = (s: Socket | null) => setSocket(s);
    _listeners.add(listener);

    // Usar .getState() en lugar del hook — es la API imperativa, NO un hook
    const user = authStore.getState().user;

    if (!user?.uid) {
      if (_socket) {
        _socket.disconnect();
        _socket = null;
        notifyListeners(null);
      }
      return () => { _listeners.delete(listener); };
    }

    if (!_socket) {
      const url =
        process.env.EXPO_PUBLIC_CHAT_URL ||
        (process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/:\d+$/, ':3004');

      _socket = io(url, {
        query: { userId: user.uid },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      _socket.on('connect', () => {
        console.log('[ChatSocket] Conectado al chat-service');
        notifyListeners(_socket);
      });
      _socket.on('disconnect', () => {
        console.log('[ChatSocket] Desconectado del chat-service');
        notifyListeners(null);
      });
    } else if (_socket.connected) {
      setSocket(_socket);
    }

    return () => { _listeners.delete(listener); };
  }, []);

  return socket;
};
