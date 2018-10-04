import { createHttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import {
  introspectSchema,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
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

  const localSchema = makeExecutableSchema({
    typeDefs: gql(typeDefs),
    resolvers,
  })

  const schema = mergeSchemas({
    schemas: [executableTranslationsSchema, localSchema],
  })

  return schema
}

export { makeSchema }
