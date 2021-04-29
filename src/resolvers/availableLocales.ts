import { AVAILABLE_LOCALES } from '../config'
import { QueryToAvailableLocalesResolver, Locale } from '../typings/generated-graphql-types'

export const availableLocales: QueryToAvailableLocalesResolver = (
) => {
  return AVAILABLE_LOCALES.split(",") as Locale[]
}
