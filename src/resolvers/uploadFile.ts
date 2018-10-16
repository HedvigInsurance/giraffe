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
const THIRTY_SECONDS = 60 * 30

export const uploadFile: MutationToUploadFileResolver = async (
  _root,
  { file },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const { stream, filename, mimetype } = await file

  const finalFile = (await new Promise((resolve) => {
    const key = `${uuid()}-${filename}`
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: stream,
      ContentType: mimetype,
      Metadata: {
        MemberId: user.memberId,
      },
    }

    s3.upload(params, UPLOAD_OPTIONS, (err) => {
      if (err) {
        resolve(undefined)
      } else {
        const signedUrl = s3.getSignedUrl('getObject', {
          Bucket: AWS_S3_BUCKET,
          Key: key,
          Expires: THIRTY_SECONDS,
        })

        resolve({
          signedUrl,
          key,
        })
      }
    })
  })) as File

  if (!finalFile) {
    throw new UserInputError("Couldn't upload file")
  }

  return finalFile
}
