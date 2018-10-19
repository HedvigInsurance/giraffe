import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { QueryToFileResolver } from '../typings/generated-graphql-types'

const THIRTY_MINUTES = 60 * 30

export const file: QueryToFileResolver = async (
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

  if (headObject.Metadata && headObject.Metadata.memberid === user.memberId) {
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Expires: THIRTY_MINUTES,
    })

    return {
      signedUrl,
      key,
    }
  }

  throw new Error('You cant access this file')
}
