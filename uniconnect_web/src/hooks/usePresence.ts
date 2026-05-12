import { useEffect, useState } from 'react';
import { useChatSocket } from '../context/SocketContext';

// El backend gestiona la presencia automáticamente via activeUsers Map
// al conectar/desconectar el socket (con userId en el handshake query).
// No hay nada que hacer desde el frontend para publicar presencia.
export function useMyPresence() {}

// Hook para LEER la presencia de otro usuario via chat-service WebSocket
export function useOtherPresence(otherUserId: string | null) {
  const [isOnline, setIsOnline] = useState(false);
  const chatSocket = useChatSocket();

  useEffect(() => {
    if (!otherUserId || !chatSocket) return;

    // Consultar estado actual al montar
    chatSocket.emit('check_user_status', { userId: otherUserId }, (res: { userId: string; status: string }) => {
      setIsOnline(res?.status === 'online');
    });

    // Escuchar cambios en tiempo real
    const handleStatusChange = (data: { userId: string; status: string }) => {
      if (data.userId === otherUserId) {
        setIsOnline(data.status === 'online');
      }
    };

    chatSocket.on('USER_STATUS_CHANGED', handleStatusChange);
    return () => { chatSocket.off('USER_STATUS_CHANGED', handleStatusChange); };
  }, [otherUserId, chatSocket]);

  return { isOnline };
}
