/// <reference path="../typings/cloudinary.d.ts" />
import { UserInputError } from 'apollo-server-koa'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid/v1'

import { getUser } from '../api'
import { AWS_KEY, AWS_S3_BUCKET, AWS_SECRET } from '../config'
import {
  File,
  MutationToUploadFileResolver,
} from '../typings/generated-graphql-types'

AWS.config.accessKeyId = AWS_KEY
AWS.config.secretAccessKey = AWS_SECRET
AWS.config.region = 'eu-central-1'

const s3 = new AWS.S3()

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }

export const uploadFile: MutationToUploadFileResolver = async (
  _root,
  { file },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const { stream, filename, mimetype } = await file

  const finalFile = (await new Promise((resolve) => {
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: `${uuid()}-${filename}`,
      Body: stream,
      ContentType: mimetype,
      Metadata: {
        MemberId: user.memberId,
      },
    }

    s3.upload(params, UPLOAD_OPTIONS, (err, data) => {
      if (err) {
        resolve({
          url: null,
        })
      } else {
        resolve({
          url: data.Location,
        })
      }
    })
  })) as File

  if (finalFile.url === null) {
    throw new UserInputError("Couldn't upload file")
  }

  return finalFile
}
