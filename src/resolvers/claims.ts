import * as uuid from 'uuid/v4'
import { getUser, setChatAudioResponse } from '../api'
import { s3 } from '../api/s3'
import { AWS_CLAIMS_S3_BUCKET } from '../config'
import { MutationToUploadClaimResolver } from '../typings/generated-graphql-types'
import { factory } from '../utils/log'

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }

const logger = factory.getLogger('resolvers/claims')

export const uploadClaim: MutationToUploadClaimResolver = async (
  _parent,
  { globalId, claim },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const { createReadStream, filename, mimetype } = await claim
  const uploadedFileUrl: string = await new Promise((resolve, reject) => {
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
  })

  return setChatAudioResponse(token, headers, {
    globalId,
    body: { url: uploadedFileUrl },
  })
}
