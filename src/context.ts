import { createUpstream, Upstream } from './api/upstream';
import { AuthenticationError } from 'apollo-server-core'
import { GraphQLSchema } from 'graphql'
import * as Koa from 'koa'
import { ConnectionContext } from 'subscriptions-transport-ws'
import * as uuidv4 from 'uuid/v4'
import { ipv6toipv4 } from './utils/ip'
import { notNullable } from './utils/nullables'

interface Context {
  getToken: TokenProvider
  headers: ForwardHeaders
  graphCMSSchema: GraphQLSchema
  remoteIp: string,
  upstream: Upstream
}

interface TokenProvider {
  (): string
}

interface ForwardHeaders {
  'User-Agent': string
  'X-Forwarded-For': string
  'X-Request-Id': string
  'Accept-Language': string
  'Enable-Simple-Sign': string
}

const getWebContext = (graphCMSSchema: GraphQLSchema) => async ({
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
  const headers = {
    'User-Agent': checkedCtx.get('User-Agent'),
    'X-Forwarded-For': checkedCtx.get('x-forwarded-for'),
    'X-Request-Id': checkedCtx.get('x-request-id') || uuidv4(),
    'Accept-Language': checkedCtx.get('accept-language'),
    'Enable-Simple-Sign': checkedCtx.get('Enable-Simple-Sign'),
  }
  return {
    getToken,
    graphCMSSchema,
    headers,
    remoteIp:
      checkedCtx.get('x-forwarded-for') || ipv6toipv4(checkedCtx.request.ip),
    upstream: createUpstream(getToken, headers)
  }
}

const getWebSocketContext = (graphCMSSchema: GraphQLSchema) => (
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
    'User-Agent': context.request.headers['User-Agent'] as string,
    'X-Forwarded-For': context.request.headers['x-forwarded-for'] as string,
    'X-Request-Id':
      typeof context.request.headers['x-request-id'] === 'string'
        ? (context.request.headers['x-request-id'] as string)
        : uuidv4(),
    'Accept-Language': context.request.headers['accept-language'] as string,
    'Enable-Simple-Sign': context.request.headers['Enable-Simple-Sign'] as string,
  }

  return {
    getToken,
    headers,
    graphCMSSchema,
    remoteIp:
      headers['X-Forwarded-For'] ||
      (context.request.connection.address() as string),
    upstream: createUpstream(getToken, headers)
  }
}

export { getWebContext, getWebSocketContext, Context, TokenProvider, ForwardHeaders }
