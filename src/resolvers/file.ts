import { getUser } from '../api'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { File, QueryToFileResolver } from '../typings/generated-graphql-types'

const THIRTY_MINUTES = 60 * 30

export const fileInner = async (
  key: string,
  memberId: string,
): Promise<File> => {
  const headObject = await s3
    .headObject({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    })
    .promise()

  if (headObject.Metadata && headObject.Metadata.memberid === memberId) {
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Expires: THIRTY_MINUTES,
    })

    return {
      signedUrl,
      bucket: AWS_S3_BUCKET,
      key,
    }
  }
  throw new Error('You cant access this file')
}

export const file: QueryToFileResolver = async (
  _root,
  { key },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  return fileInner(key, user.memberId)
}
