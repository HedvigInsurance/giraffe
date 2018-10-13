declare module 'cloudinary' {
  import { Stream } from 'stream'

  interface CloudinaryConfigParams {
    cloud_name: string
    api_key: string
    api_secret: string
  }

  interface Uploader {
    upload_stream: (callback: (error: any, result: any) => void) => Stream
  }

  interface CloudinaryV2 {
    uploader: Uploader
  }

  interface Cloudinary {
    config: (params: CloudinaryConfigParams) => void
    v2: CloudinaryV2
  }

  const cloudinary: Cloudinary
  export = cloudinary
}
