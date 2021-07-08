import { QueryResolvers } from '../generated/graphql'
import * as geoip from "geoip-lite"

export const geo: QueryResolvers['geo'] = async (
  _root,
  {},
  { getToken, remoteIp },
) => {
  getToken()

  const ipLookup = geoip.lookup(remoteIp)

  if (ipLookup) {
      return {
          countryISOCode: ipLookup.country
      }
  }

  throw new Error("couldn't do a geo lookup")
}
