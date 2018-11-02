import { GraphQLError } from 'graphql'

export const getInnerErrorsFromCombinedError = (
  error: GraphQLError,
): Error[] => {
  const innerErrors: Error[] = []
  const unsafelyCastedError = error.originalError as any
  if (
    unsafelyCastedError &&
    unsafelyCastedError.errors &&
    Array.isArray(unsafelyCastedError.errors)
  ) {
    unsafelyCastedError.errors.forEach((err: Error) => innerErrors.push(err))
  }

  return innerErrors
}
