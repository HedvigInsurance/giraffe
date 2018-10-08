import { createHttpLink } from 'apollo-link-http'
import { gql } from 'apollo-server-koa'
import { readFileSync } from 'fs'
import {
  FilterRootFields,
  introspectSchema,
  IResolvers,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
} from 'graphql-tools'
import fetch from 'node-fetch'
import { resolve } from 'path'
import { Context } from './context'
import { resolvers } from './resolvers'

const typeDefs = gql(
  readFileSync(resolve(__dirname, './schema.graphqls'), 'utf8'),
)

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

  const localSchema = makeExecutableSchema<Context>({
    typeDefs,
    resolvers: resolvers as IResolvers<any, Context>, // Not a big fan of this cast, but it will do for now
  })

  const schema = mergeSchemas({
    schemas: [transformedTranslationSchema, localSchema],
  })

  return schema
}

export { makeSchema }
