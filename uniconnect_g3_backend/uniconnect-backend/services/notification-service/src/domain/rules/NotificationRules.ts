interface Rule {
  priority: string;
  permitirResumen: boolean;
  requiresAction?: boolean;
}

const NotificationRules: Record<string, Rule> = {
  NUEVO_MENSAJE: { priority: 'normal', permitirResumen: true },
  MENCION: { priority: 'normal', permitirResumen: true },
  MIEMBRO_ACEPTADO: { priority: 'normal', permitirResumen: true },
  MIEMBRO_RECHAZADO: { priority: 'normal', permitirResumen: true },
  SOLICITUD_INGRESO: { priority: 'urgente', requiresAction: true, permitirResumen: true },
  NUEVO_EVENTO: { priority: 'urgente', permitirResumen: true },
  TRANSFERENCIA_ADMIN: { priority: 'critica', permitirResumen: false },
  TRANSFERENCIA_ADMIN_SOLICITADA: { priority: 'critica', requiresAction: true, permitirResumen: false },
  TRANSFERENCIA_ADMIN_ACEPTADA: { priority: 'normal', permitirResumen: true },
  TRANSFERENCIA_ADMIN_RECHAZADA: { priority: 'normal', permitirResumen: true }
};

export default NotificationRules;
export { Rule };
