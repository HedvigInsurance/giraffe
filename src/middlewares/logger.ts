import * as Koa from 'koa'
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
const logger = factory.getLogger('koa')

const loggingMiddleware = async (
  ctx: Koa.Context,
  next: () => Promise<any>,
) => {
  await next()
  const { request, response } = ctx
  logger.info(`${request.method} '${request.url}' ${response.status}`)
}

export { loggingMiddleware as logger }
