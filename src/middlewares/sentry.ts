import * as Sentry from '@sentry/node'
import { IMiddleware } from 'graphql-middleware'
import { getInnerErrorsFromCombinedError } from '../utils/graphql-error'

export const sentryMiddleware: IMiddleware = async (
  resolve,
  parent,
  args,
  ctx,
  info,
) => {
  const sentry = new Sentry.Hub(
    Sentry.getCurrentHub().getClient(),
    new Sentry.Scope().setTag(
      'requestUuid',
      ctx.headers['X-Request-Id'] || 'no request id :(',
    ),
  )

  try {
    const res = await resolve(parent, args, ctx, info)
    return res
  } catch (e) {
    getInnerErrorsFromCombinedError(e).forEach((err) =>
      sentry.captureException(err),
    )
    throw e
  }
}
