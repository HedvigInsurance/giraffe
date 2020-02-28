import { UserInputError } from 'apollo-server-koa'
// @ts-ignore - typescript refuses to cooperate
import streamToPromise = require('stream-to-promise')

import * as uuid from 'uuid/v1'

import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { generateBlurhash } from '../features/blurhash'
import {
  File,
  MutationToUploadFileResolver,
  MutationToUploadFilesResolver,
} from '../typings/generated-graphql-types'
import { factory } from '../utils/log'

const logger = factory.getLogger('resolvers/uploadFile')

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const THIRTY_MINUTES = 60 * 30

export const uploadFile: MutationToUploadFileResolver = async (
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

export const uploadFiles: MutationToUploadFilesResolver = async (
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

const uploadFileInner = async (file: any, memberId: string) => {
  const { createReadStream, filename, mimetype } = file
  const key = `${uuid()}-${filename}`

  const body = await streamToPromise(createReadStream())
  let blurhash: string | undefined
  if (mimetype.startsWith('image')) {
    try {
      blurhash = await generateBlurhash(body)
    } catch (e) {
      // No-op. Blurhash is a bonus
    }
  }

  const metadata: AWS.S3.Metadata = {
    MemberId: memberId,
  }

  if (blurhash) {
    metadata.Blurhash = blurhash
  }

  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: mimetype,
    Metadata: metadata,
  }

  throw Error('Foo')

  return new Promise<File>((resolve) => {
    s3.upload(params, UPLOAD_OPTIONS, (err) => {
      if (err) {
        logger.error('Got error when attempting to upload error: ', err)
        resolve(undefined)
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
          blurhash,
        })
      }
    })
  })
}
