class LoggerSingleton {
  public static instance: LoggerSingleton;
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

  private _formatMessage(level: string, message: string, meta?: unknown): string {
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

  public info(message: string, meta: unknown = null): void {
    console.log(this._formatMessage(this.levels.INFO, message, meta));
  }

  public debug(message: string, meta: unknown = null): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this._formatMessage(this.levels.DEBUG, message, meta));
    }
  }

  public warning(message: string, meta: unknown = null): void {
    console.warn(this._formatMessage(this.levels.WARNING, message, meta));
  }

  public error(message: string, errorOrMeta: unknown = null): void {
    console.error(this._formatMessage(this.levels.ERROR, message, errorOrMeta));
  }

  public critical(message: string, errorOrMeta: unknown = null): void {
    console.error(this._formatMessage(this.levels.CRITICAL, ` CRITICAL  - ${message}`, errorOrMeta));
  }
}

const logger = new LoggerSingleton();
export default logger;
