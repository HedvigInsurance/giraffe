import * as winston from 'winston'
import * as Config from '../config'


interface LoggerFactory {
  getLogger(name: string): winston.Logger
}

const factory: LoggerFactory = {
  getLogger: (name) =>
    winston.createLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.errors({
          stack: true
        }),
        winston.format.label({
          label: name,
        }),
        winston.format.timestamp(),
        Config.JSON_LOGGING ? winston.format.json() : winston.format.simple(),
      ),
    }),
}

export { factory }
