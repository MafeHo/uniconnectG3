import { useEffect, useState } from 'react';
import { useChatSocket } from './useChatSocket';

export function useMyPresence() {}

export function useOtherPresence(otherUserId: string | null) {
  const [isOnline, setIsOnline] = useState(false);
  const chatSocket = useChatSocket();

  // Trackea si el socket está conectado para forzar re-ejecución del useEffect
  const [socketConnected, setSocketConnected] = useState(
    () => chatSocket?.connected ?? false
  );

  // Escucha los eventos connect/disconnect del socket para actualizar socketConnected
  useEffect(() => {
    if (!chatSocket) return;
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    chatSocket.on('connect', onConnect);
    chatSocket.on('disconnect', onDisconnect);
    // Si ya está conectado, actualiza inmediatamente
    if (chatSocket.connected) setSocketConnected(true);
    return () => {
      chatSocket.off('connect', onConnect);
      chatSocket.off('disconnect', onDisconnect);
    };
  }, [chatSocket]);

  // Registra el listener de presencia solo cuando el socket esté conectado
  useEffect(() => {
    if (!otherUserId || !chatSocket || !socketConnected) return;

    // Consulta estado inicial
    chatSocket.emit('check_user_status', { userId: otherUserId }, (res: any) => {
      setIsOnline(res?.status === 'online');
    });

    // Listener en tiempo real
    const handler = (data: { userId: string; status: string }) => {
      if (data.userId === otherUserId) setIsOnline(data.status === 'online');
    };
    chatSocket.on('USER_STATUS_CHANGED', handler);

    return () => {
      chatSocket.off('USER_STATUS_CHANGED', handler);
    };
  }, [otherUserId, chatSocket, socketConnected]);

  return { isOnline };
}
