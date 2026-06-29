enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private component: string;

  constructor(component: string) {
    this.component = component;
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry = this.formatLog(level, message, data);
    
    const logMessage = `[${entry.timestamp}] [${entry.level}] [${entry.component}] ${entry.message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.DEBUG:
        if (process.env.DEBUG === 'true') {
          console.debug(logMessage, data || '');
        }
        break;
      case LogLevel.INFO:
      default:
        console.log(logMessage, data || '');
        break;
    }
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
}

// Create loggers for different components
export const riskAnalysisLogger = new Logger('RiskAnalysis');
export const categorizationLogger = new Logger('Categorization');
export const heuristicLogger = new Logger('Heuristic');
export const scoringLogger = new Logger('Scoring');
export const llmLogger = new Logger('LLM');
export const validationLogger = new Logger('Validation');

export { Logger, LogLevel };
