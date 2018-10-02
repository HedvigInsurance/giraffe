import { ContextFunction } from 'apollo-server-core'
import * as Koa from 'koa'
import { notNullable } from './utils/nullables'

const context: ContextFunction<{ ctx?: Koa.Context; token?: string }> = async ({
  ctx,
}) => {
  const checkedCtx = notNullable(ctx)
  return { token: checkedCtx.headers.authorization }
}

export { context }
