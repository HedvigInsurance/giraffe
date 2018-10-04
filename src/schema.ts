import { createHttpLink } from 'apollo-link-http'
import { buildClientSchema, introspectionQuery } from 'graphql'
import gql from 'graphql-tag'
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
} from 'graphql-tools'
import fetch from 'node-fetch'

import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'

const makeSchema = async () => {
  const translationSchema = await fetch(
    'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: introspectionQuery }),
    },
  ).then((res) => res.json())
  const translationsLink = createHttpLink({
    uri: 'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
    fetch: fetch as any,
  })

  const executableTranslationsSchema = makeRemoteExecutableSchema({
    schema: buildClientSchema(translationSchema.data),
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
