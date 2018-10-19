import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { QueryToFileUrlResolver } from '../typings/generated-graphql-types'

const THIRTY_SECONDS = 60 * 30

export const fileUrl: QueryToFileUrlResolver = async (
  _root,
  { key },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const headObject = await s3
    .headObject({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    })
    .promise()

  if (headObject.Metadata && headObject.Metadata.memberId === user.memberId) {
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Expires: THIRTY_SECONDS,
    })

    return {
      signedUrl,
      key,
    }
  }

  throw new Error('You cant access this file')
}
