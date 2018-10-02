import { createHttpLink } from 'apollo-link-http'
import { buildClientSchema } from 'graphql'
import gql from 'graphql-tag'
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
} from 'graphql-tools'
import fetch from 'node-fetch'

const translationSchema = require('./external-schemas/translations.json') // tslint:disable-line no-var-requires
import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'

const translationsLink = createHttpLink({
  uri: 'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
  fetch: fetch as any,
})

const executableTranslationsSchema = makeRemoteExecutableSchema({
  schema: buildClientSchema(translationSchema),
  link: translationsLink,
})

const localSchema = makeExecutableSchema({
  typeDefs: gql(typeDefs),
  resolvers,
})

const schema = mergeSchemas({
  schemas: [executableTranslationsSchema, localSchema],
})

export { schema }
