import { UserInputError } from 'apollo-server-koa'

import * as uuid from 'uuid/v1'

import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import {
  File,
  MutationResolvers
} from '../generated/graphql'
import { factory } from '../utils/log'

const logger = factory.getLogger('resolvers/uploadFile')

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const THIRTY_MINUTES = 60 * 30

export const uploadFile: MutationResolvers['uploadFile'] = async (
  _root,
  { file },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const resolvedFile = await file

  const finalFile = await uploadFileInner(resolvedFile, user.memberId)
  if (!finalFile) {
    throw new UserInputError("Couldn't upload file")
  }

  return finalFile
}

export const uploadFiles: MutationResolvers['uploadFiles'] = async (
  _root,
  { files },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const resolvedFiles = await Promise.all(files)
  const uploads = await Promise.all(
    resolvedFiles.map((f) => uploadFileInner(f, user.memberId)),
  )

  if (uploads.filter((u) => !u).length > 0) {
    throw new UserInputError("Couldn't upload files")
  }

  return uploads
}

const uploadFileInner = (file: any, memberId: string) => {
  return new Promise<File>((resolve) => {
    const { createReadStream, filename, mimetype } = file
    const key = `${uuid()}-${filename}`
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(),
      ContentType: mimetype,
      Metadata: {
        MemberId: memberId,
      },
    }

    s3.upload(params, UPLOAD_OPTIONS, (err) => {
      if (err) {
        logger.error('Got error when attempting to upload error: ', err)
        throw new Error("Got error when attempting to upload error")
      } else {
        const signedUrl = s3.getSignedUrl('getObject', {
          Bucket: AWS_S3_BUCKET,
          Key: key,
          Expires: THIRTY_MINUTES,
        })

        resolve({
          signedUrl,
          bucket: AWS_S3_BUCKET,
          key,
        })
      }
    })
  })
}
