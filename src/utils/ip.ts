import { isIPv6 } from 'net'
export const ipv6toipv4 = (potentiallyIpv6: string): string => {
  if (!isIPv6(potentiallyIpv6)) {
    return potentiallyIpv6
  }

  return potentiallyIpv6.replace(/^.*:/, '')
}
