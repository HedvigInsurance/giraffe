import {
  LFService,
  LoggerFactoryOptions,
  LogGroupRule,
  LogLevel,
} from 'typescript-logging'

const options = new LoggerFactoryOptions().addLogGroupRule(
  new LogGroupRule(/.+/, LogLevel.fromString('info')),
)

const factory = LFService.createLoggerFactory(options)

export { factory }
