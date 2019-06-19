import * as AWS from 'aws-sdk'
import * as elasticsearch from 'elasticsearch'
import * as connectionClass from 'http-aws-es'
import {
  AWS_ELASTICSEARCH_ACCESS_KEY_ID,
  AWS_ELASTICSEARCH_ENDPOINT,
  AWS_ELASTICSEARCH_SECRET_ACCESS_KEY,
} from '../config'

export const esClient = new elasticsearch.Client({
  awsConfig: new AWS.Config({
    accessKeyId: AWS_ELASTICSEARCH_ACCESS_KEY_ID,
    secretAccessKey: AWS_ELASTICSEARCH_SECRET_ACCESS_KEY,
    region: 'eu-central-1',
  }),
  connectionClass,
  host: AWS_ELASTICSEARCH_ENDPOINT,
  log: ['error'],
})
