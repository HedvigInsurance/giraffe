import * as config from '../config'
import {ForwardHeaders, TokenProvider} from '../context';
import {createContextfulHttpClient, HttpClient} from './httpClient';
import {createUnderwriterClient, UnderwriterClient} from './upstreams/underwriter';
import {createProductPricingClient, ProductPricingClient} from './upstreams/productPricing';
import {createMemberServiceClient, MemberServiceClient} from './upstreams/memberService';

/**
 * An umbrella type that groups different upstream services, making it
 * easy to inject in the Context.
 *
 * Then it can be used in functions like
 * ```typescript
 * { upstream } // injected into GraphQL resolve function for instance
 * ...
 * const quote = await upstream.underwriter.getQuote("id")
 * ```
 */
export interface Upstream {
  memberService: MemberServiceClient,
  productPricing: ProductPricingClient,
  underwriter: UnderwriterClient,
  claimService: ClaimServiceClient
}

export const createUpstream = (
  token: TokenProvider,
  headers: ForwardHeaders
): Upstream => {

  const createHttpClient = (remotePathPrefix: string, localPort: number): HttpClient => {
    const allHeaders = (headers as any) as { [key: string]: string }

    const baseUrl: string = config.UPSTREAM_MODE === "local"
      ? `http://localhost:${localPort}`
      : `${config.BASE_URL}${remotePathPrefix}`
    if (config.UPSTREAM_MODE == "local" && config.LOCAL_MEMBERID_OVERRIDE) {
      allHeaders["Hedvig.token"] = config.LOCAL_MEMBERID_OVERRIDE as string
    }
    return createContextfulHttpClient(baseUrl, token, allHeaders)
  }

  return {
    memberService: createMemberServiceClient(
      createHttpClient("/member", 4084)
    ),
    productPricing: createProductPricingClient(
      createHttpClient("/productPricing", 4085)
    ),
    underwriter: createUnderwriterClient(
      createHttpClient("/underwriter", 5698)
    ),
    claimService: createClaimServiceClient(
      createHttpClient("/claims", 4083))
  }
}
