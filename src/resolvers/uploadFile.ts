import { UserInputError } from 'apollo-server-koa'

import * as uuid from 'uuid/v1'

import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import {
  File,
  MutationToUploadFileResolver,
} from '../typings/generated-graphql-types'

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const THIRTY_MINUTES = 60 * 30

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
          Expires: THIRTY_MINUTES,
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
