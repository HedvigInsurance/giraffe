import { AVAILABLE_LOCALES } from '../config'
import { Locale, QueryResolvers } from '../generated/graphql'

export const availableLocales: QueryResolvers['availableLocales'] = (
): Locale[] => {
  return AVAILABLE_LOCALES.split(",") as Locale[]
}
