import * as Koa from 'koa'
import { factory } from '../utils/log'

const logger = factory.getLogger('koa')

const loggingMiddleware = async (
  ctx: Koa.Context,
  next: () => Promise<any>,
) => {
  await next()
  const { request, response } = ctx
  if (response.length < 5000) {
    logger.info(`${request.method} '${request.url}' ${response.status}\nbody:${response.body}`)
  } else {
    logger.info(`${request.method} '${request.url}' ${response.status}`)
  }
}

export { loggingMiddleware }
