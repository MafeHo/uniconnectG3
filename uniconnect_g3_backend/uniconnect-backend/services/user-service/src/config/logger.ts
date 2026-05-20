class LoggerSingleton {
  private static instance: LoggerSingleton;
  private levels!: {
    INFO: string;
    DEBUG: string;
    WARNING: string;
    ERROR: string;
    CRITICAL: string;
  };

  constructor() {
    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    this.levels = {
      INFO: 'INFO',
      DEBUG: 'DEBUG',
      WARNING: 'WARNING',
      ERROR: 'ERROR',
      CRITICAL: 'CRITICAL'
    };

    LoggerSingleton.instance = this;
  }

  private _formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    let msg = `[${timestamp}] [${level}] ${message}`;
    if (meta) {
      if (meta instanceof Error) {
        msg += ` | Stack: ${meta.stack}`;
      } else {
        try {
          msg += ` | Meta: ${JSON.stringify(meta)}`;
        } catch {
          msg += ` | Meta: [Unserializable Object]`;
        }
      }
    }
    return msg;
  }

  public info(message: string, meta: unknown = null) {
    console.log(this._formatMessage(this.levels.INFO, message, meta));
  }

  public debug(message: string, meta: unknown = null) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this._formatMessage(this.levels.DEBUG, message, meta));
    }
  }

  public warning(message: string, meta: unknown = null) {
    console.warn(this._formatMessage(this.levels.WARNING, message, meta));
  }

  public error(message: string, errorOrMeta: unknown = null) {
    console.error(this._formatMessage(this.levels.ERROR, message, errorOrMeta));
  }

  public critical(message: string, errorOrMeta: unknown = null) {
    console.error(this._formatMessage(this.levels.CRITICAL, ` CRITICAL  - ${message}`, errorOrMeta));
  }
}

const logger = new LoggerSingleton();
export default logger;
export { LoggerSingleton };
