import { AuthenticationError, ContextFunction } from 'apollo-server-core'
import * as Koa from 'koa'
import { notNullable } from './utils/nullables'

const context: ContextFunction<{
  ctx?: Koa.Context
  getToken?: () => string
}> = async ({ ctx }) => {
  const checkedCtx = notNullable(ctx)
  const getToken = () => {
    if (!checkedCtx.headers.authorization) {
      throw new AuthenticationError('Must be logged in')
    }
    return checkedCtx.header.authorization
  }
  return { getToken }
}

export { context }
