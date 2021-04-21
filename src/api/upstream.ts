import { createProductPricingClient, ProductPricingClient } from './upstreams/productPricing';
import { createContextfulHttpClient, HttpClient } from './httpClient';
import { TokenProvider, ForwardHeaders } from '../context';
import * as config from '../config'

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
    productPricing: ProductPricingClient
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
        productPricing: createProductPricingClient(
            createHttpClient("/productPricing", 4085)
        )
    }
}
