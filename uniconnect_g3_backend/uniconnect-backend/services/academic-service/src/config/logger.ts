class LoggerSingleton {
  private static instance: LoggerSingleton;
  private levels = {
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  };

  constructor() {
    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    LoggerSingleton.instance = this;
  }

  private _formatMessage(level: string, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    let msg = `[${timestamp}] [${level}] ${message}`;
    if (meta) {
      if (meta instanceof Error) {
        msg += ` | Stack: ${meta.stack}`;
      } else {
        msg += ` | Meta: ${JSON.stringify(meta)}`;
      }
    }
    return msg;
  }

  info(message: string, meta: unknown = null) {
    console.log(this._formatMessage(this.levels.INFO, message, meta));
  }

  debug(message: string, meta: unknown = null) {
    // Podría deshabilitarse en producción
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this._formatMessage(this.levels.DEBUG, message, meta));
    }
  }

  warning(message: string, meta: unknown = null) {
    console.warn(this._formatMessage(this.levels.WARNING, message, meta));
  }

  error(message: string, errorOrMeta: unknown = null) {
    console.error(this._formatMessage(this.levels.ERROR, message, errorOrMeta));
  }

  critical(message: string, errorOrMeta: unknown = null) {
    // Aquí se podrían añadir alertas por correo, slack, etc.
    console.error(this._formatMessage(this.levels.CRITICAL, ` CRITICAL  - ${message}`, errorOrMeta));
  }
}

const logger = new LoggerSingleton();

export default logger;
