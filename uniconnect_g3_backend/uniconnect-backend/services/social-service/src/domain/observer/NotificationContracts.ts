export interface IPushNotificationData {
  groupId?: string;
  groupName?: string;
  candidateId?: string;
  targetUserId?: string;
  oldAdminId?: string;
  requesterId?: string;
  userName?: string;
  newState?: string;
  message?: string;
  sessionId?: string;
  sessionTitle?: string;
  sessionDate?: string;
  sessionTime?: string;
  [key: string]: unknown; // Extensibilidad segura
}

export interface IPushNotificationRequest {
  event: string;
  payload: IPushNotificationData;
}
