import * as Koa from 'koa'
import * as winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

const loggingMiddleware = async (
  ctx: Koa.Context,
  next: () => Promise<any>,
) => {
  await next()
  const { request, response } = ctx
  logger.info(`${request.method} '${request.url}' ${response.status}`)
}

export { loggingMiddleware as logger }
