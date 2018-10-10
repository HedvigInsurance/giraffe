// tslint:disable no-console
import { generateTypeScriptTypes } from '@hedviginsurance/graphql-schema-typescript' // tslint:disable-line no-implicit-dependencies
import { readFileSync } from 'fs'
import { resolve } from 'path'

const schemaPath = resolve('./src/schema.graphqls')
const schema = readFileSync(schemaPath, 'utf8')

generateTypeScriptTypes(schema, './src/typings/generated-graphql-types.ts', {
  typePrefix: '',
  asyncResult: true,
  contextType: 'Context',
  importStatements: [`import { Context } from '../context'`],
  smartTParent: true,
  smartTResult: true,
})
  .then(() => console.log('Generated typescript types'))
  .catch((e) => console.error('Failed to generate typescript types: ', e))
