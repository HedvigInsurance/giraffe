/// <reference path="../typings/cloudinary.d.ts" />
import { UserInputError } from 'apollo-server-koa'
import * as cloudinary from 'cloudinary'

import {
  File,
  MutationToUploadFileResolver,
} from '../typings/generated-graphql-types'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export const uploadFile: MutationToUploadFileResolver = async (
  _root,
  { file },
) => {
  const { stream } = await file

  const finalFile = (await new Promise((resolve) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(function(
      error,
      result,
    ) {
      if (error) {
        return resolve({ url: null })
      }

      resolve({ url: result.secure_url })
    })
    stream.pipe(uploadStream)
  })) as File

  if (!finalFile.url) {
    throw new UserInputError("Couldn't upload file")
  }

  return finalFile
}
