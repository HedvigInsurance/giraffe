import * as domino from 'domino'
import fetch from 'node-fetch'
const { getMetadata } = require('page-metadata-parser')

export const getSiteMetadata = async (url: string) => {
  const absoluteUrl = !/^https?:\/\//i.test(url.replace(/^(www\.)/, ''))
    ? `http://${url}`
    : url

  const response = await fetch(absoluteUrl)
  const html = await response.text()
  const doc = domino.createWindow(html).document
  const metadata = getMetadata(doc, absoluteUrl)
  return metadata
}
