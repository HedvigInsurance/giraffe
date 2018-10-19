import * as AWS from 'aws-sdk'

import { AWS_KEY, AWS_SECRET } from '../config'

AWS.config.accessKeyId = AWS_KEY
AWS.config.secretAccessKey = AWS_SECRET
AWS.config.region = 'eu-central-1'

export const s3 = new AWS.S3()
