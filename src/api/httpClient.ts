
import fetch, { RequestInit, Response } from 'node-fetch'
import { TokenProvider } from '../context'

/**
 * A client that can perform upstream HTTP calls. It can be assumed
 * to contain the necessary headers to fire calls in the current context.
 */
export interface HttpClient {
  get(url: string, options?: HttpCallOptions): Promise<Response>
  post(url: string, body: any, options?: HttpCallOptions): Promise<Response>
  put(url: string, body: any, options?: HttpCallOptions): Promise<Response>
  delete(url: string, options?: HttpCallOptions): Promise<Response>
}

export class HttpError extends Error {
  constructor(public statusCode: number, public url: string, public body: any) {
    super(`HTTP error - statusCode ${statusCode}, url: ${url}`)
    this.name = "HttpError"
  }
}

interface HttpCallOptions {
  validStatusCodes?: number[]
}

/**
 * Create a HttpClient that comes with a pre-packaged base-url,
 * auth token and headers.
 */
export const createContextfulHttpClient = (
  baseUrl: string,
  getToken: TokenProvider,
  forwardHeaders: { [key: string]: string }
): HttpClient => {
  const call = async (method: RequestInit['method'], url: string, body?: unknown, options?: HttpCallOptions): Promise<Response> => {
    const headers: { [key: string]: string } = {
      ...forwardHeaders,
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`
    }
    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    const requestOptions: RequestInit = {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      headers: headers,
    }

    const fullUrl = `${baseUrl}${url}`
    const res = await fetch(fullUrl, requestOptions)

    if (res.status >= 400) {
      const isOverriddenToSucceed = options?.validStatusCodes && options.validStatusCodes.includes(res.status)
      if (!isOverriddenToSucceed) {
        throw new HttpError(res.status, fullUrl, await res.json())
      }
    }

    return res
  }

  return {
    get: (url, options) => call('GET', url, undefined, options),
    post: (url, body, options) => call('POST', url, body, options),
    put: (url, body, options) => call('PUT', url, body, options),
    delete: (url, options) => call('DELETE', url, undefined, options),
  }
}
