import { QueryToTravelResolver } from '../typings/generated-graphql-types'
import * as geoip from "geoip-lite"

export const travel: QueryToTravelResolver = async (
  _root,
  {},
  { getToken, remoteIp },
) => {
  getToken()

  const ipLookup = geoip.lookup(remoteIp)

  if (ipLookup) {
      return {
          possiblyTravelling: ipLookup.country != "SE",
          countryISOCode: ipLookup.country
      }
  }
  
  return {
      possiblyTravelling: false,
      countryISOCode: "SE"
  }
}