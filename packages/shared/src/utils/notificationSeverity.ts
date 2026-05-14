/**
 * Clasificación de severidad de notificaciones
 * 
 * Este módulo proporciona una clasificación unificada de notificaciones
 * según su urgencia, para uso en web y mobile.
 */

export type NotificationSeverity = 'high' | 'medium' | 'low';

export interface SeverityColors {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

/**
 * Colores por severidad (Tailwind-compatible)
 */
export const SEVERITY_COLORS: Record<NotificationSeverity, SeverityColors> = {
  high: {
    bg: '#fee2e2',      // red-100
    border: '#dc2626',  // red-600
    text: '#991b1b',    // red-800
    icon: '#dc2626'
  },
  medium: {
    bg: '#fef3c7',      // yellow-100
    border: '#f59e0b',  // yellow-500
    text: '#92400e',    // yellow-800
    icon: '#f59e0b'
  },
  low: {
    bg: '#d1fae5',      // green-100
    border: '#10b981',  // green-500
    text: '#065f46',    // green-800
    icon: '#10b981'
  }
};

/**
 * Determina la severidad de una notificación según su tipo
 * 
 * @param metadataType - El tipo de notificación desde metadata.type
 * @returns La severidad: 'high', 'medium', o 'low'
 * 
 * @example
 * ```ts
 * const severity = getNotificationSeverity('admin_transfer');
 * // => 'high'
 * ```
 */
export function getNotificationSeverity(metadataType?: string): NotificationSeverity {
  if (!metadataType) return 'low';

  // 🔴 ALTA - Requiere acción inmediata
  const highSeverity = [
    'admin_transfer',           // Transferencia de administrador
    'admin_transfer_requested', // Solicitud de transferencia
    'group_request'             // Solicitud de ingreso a grupo
  ];

  // 🟡 MODERADA - Información importante
  const mediumSeverity = [
    'request_rejected',         // Solicitud rechazada
    'admin_transfer_rejected',  // Transferencia rechazada
    'admin_transfer_accepted'   // Transferencia aceptada
  ];

  // 🟢 BAJA - Informativa (default)
  // request_accepted, mention, new_event, new_member, etc.

  if (highSeverity.includes(metadataType)) {
    return 'high';
  }

  if (mediumSeverity.includes(metadataType)) {
    return 'medium';
  }

  return 'low';
}
