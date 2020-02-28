import { encode } from 'blurhash'
// @ts-ignore - TypeScript refuses to cooperate
import pixels = require('image-pixels')

export const generateBlurhash = async (b: Buffer): Promise<string> => {
  const { data, width, height } = await pixels(b)
  return encode(data, width, height, 4, 4)
}
