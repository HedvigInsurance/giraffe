import fetch from 'node-fetch'
import * as config from '../config'
import { QueryToAngelStoryResolver } from '../typings/generated-graphql-types'
import { factory } from '../utils/log'

const logger = factory.getLogger('angelStory')

export const angelStory: QueryToAngelStoryResolver = async (
  _parent,
  { name, locale },
) => {
  try {
    const story = await fetch(
      `${config.ANGEL_URL}angel-data?name=${encodeURIComponent(
        name,
      )}&locale=${encodeURIComponent(locale || '')}`,
    )
    return {
      content: await story.text(),
    }
  } catch (e) {
    logger.error('error when fetching angel story', e)
    return null
  }
}
