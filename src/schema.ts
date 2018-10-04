import { createHttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import {
  FilterRootFields,
  introspectSchema,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
} from 'graphql-tools'
import fetch from 'node-fetch'
import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'

const makeSchema = async () => {
  const translationsLink = createHttpLink({
    uri: 'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
    fetch: fetch as any,
  })

  const translationSchema = await introspectSchema(translationsLink)

  const executableTranslationsSchema = makeRemoteExecutableSchema({
    schema: translationSchema,
    link: translationsLink,
  })

  const transformedTranslationSchema = transformSchema(
    executableTranslationsSchema,
    [new FilterRootFields((_, name) => name === 'languages')],
  )

  // @ts-ignore
  const localSchema = makeExecutableSchema({
    typeDefs: gql(typeDefs),
    resolvers,
  })

  const schema = mergeSchemas({
    schemas: [transformedTranslationSchema, localSchema],
  })

  return schema
}

export { makeSchema }
