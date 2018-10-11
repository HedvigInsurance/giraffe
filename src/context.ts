import { AuthenticationError } from 'apollo-server-core'
import * as Koa from 'koa'
import { ConnectionContext } from 'subscriptions-transport-ws'
import * as uuidv4 from 'uuid/v4'
import { notNullable } from './utils/nullables'

interface Context {
  getToken: () => string
  headers: ForwardHeaders
}

interface ForwardHeaders {
  'X-Forwarded-For': string
  'X-Request-Id': string
}

const getWebContext = async ({
  ctx,
}: {
  ctx: Koa.Context
}): Promise<Context> => {
  const checkedCtx = notNullable(ctx)
  const getToken = () => {
    if (!checkedCtx.headers.authorization) {
      throw new AuthenticationError('Must be logged in')
    }
    return checkedCtx.header.authorization
  }
  return {
    getToken,
    headers: {
      'X-Forwarded-For': checkedCtx.get('x-forwarded-for'),
      'X-Request-Id': checkedCtx.get('x-request-id'),
    },
  }
}

const getWebSocketContext = (
  connectionParams: { Authorization: string },
  _webSocket: any,
  context: ConnectionContext,
): Context => {
  const getToken = () => {
    if (!connectionParams.Authorization) {
      throw new AuthenticationError('Must be logged in')
    }
    return connectionParams.Authorization
  }
  const headers: ForwardHeaders = {
    'X-Forwarded-For': context.request.headers['x-forwarded-for'] as string,
    'X-Request-Id':
      typeof context.request.headers['x-request-id'] === 'string'
        ? (context.request.headers['x-request-id'] as string)
        : uuidv4(),
  }

  return {
    getToken,
    headers,
  }
}

export { getWebContext, getWebSocketContext, Context, ForwardHeaders }
