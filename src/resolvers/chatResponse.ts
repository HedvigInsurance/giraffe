import * as uuid from 'uuid/v4'
import { getUser, setChatResponse, setChatSingleSelectResponse } from '../api'
import { s3 } from '../api/s3'
import { AWS_CLAIMS_S3_BUCKET } from '../config'
import { factory } from '../utils/log'
import { setChatAudioResponse, setChatFileResponse } from './../api/index'
import {
  MutationToSendChatAudioResponseResolver,
  MutationToSendChatFileResponseResolver,
  MutationToSendChatSingleSelectResponseResolver,
  MutationToSendChatTextResponseResolver,
} from './../typings/generated-graphql-types'

const logger = factory.getLogger('resolvers/chatResponse')

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }

export const sendChatTextResponse: MutationToSendChatTextResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatResponse(token, headers, input)
}

export const sendChatSingleSelectResponse: MutationToSendChatSingleSelectResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatSingleSelectResponse(token, headers, input)
}

export const sendChatFileResponse: MutationToSendChatFileResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatFileResponse(token, headers, input)
}

export const sendChatAudioResponse: MutationToSendChatAudioResponseResolver = async (
  _root,
  { input: { file, globalId } },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const { createReadStream, filename, mimetype } = await file
  const uploadedFileUrl: string = await new Promise<string>(
    (resolve, reject) => {
      const key = `${uuid()}-${filename}`
      const params = {
        Bucket: AWS_CLAIMS_S3_BUCKET,
        Key: key,
        Body: createReadStream(),
        ContentType: mimetype,
        Metadata: {
          MemberId: user.memberId,
        },
      }

      s3.upload(params, UPLOAD_OPTIONS, (err, data) => {
        if (err) {
          logger.error('Got error when attempting to upload', err)
          reject(err)
          return
        }

        resolve(data.Location)
      })
    },
  )
  return setChatAudioResponse(token, headers, {
    globalId,
    url: uploadedFileUrl,
  })
}
