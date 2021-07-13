import fetch from 'node-fetch'
import * as config from '../config'
import { AngelStory, QueryResolvers, Maybe } from '../generated/graphql'
import { factory } from '../utils/log'

const logger = factory.getLogger('angelStory')

export const angelStory: QueryResolvers['angelStory'] = async (
  _parent,
  { name, locale },
  _context
): Promise<Maybe<AngelStory>> => {
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
    return undefined
  }
}
