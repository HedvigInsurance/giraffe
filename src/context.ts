import { AuthenticationError } from 'apollo-server-core'
import * as Koa from 'koa'
import { notNullable } from './utils/nullables'

interface Context {
  getToken: () => string
}

const context = async ({ ctx }: { ctx: Koa.Context }): Promise<Context> => {
  const checkedCtx = notNullable(ctx)
  const getToken = () => {
    if (!checkedCtx.headers.authorization) {
      throw new AuthenticationError('Must be logged in')
    }
    return checkedCtx.header.authorization
  }
  return { getToken }
}

export { context, Context }
