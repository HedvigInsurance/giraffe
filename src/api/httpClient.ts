
import fetch, { RequestInit, Response } from 'node-fetch'
import { TokenProvider } from '../context'

/**
 * A client that can perform upstream HTTP calls. It can be assumed
 * to contain the necessary headers to fire calls in the current context.
 */
export interface HttpClient {
  get(url: string): Promise<Response>
  post(url: string, body: any): Promise<Response>
  put(url: string, body: any): Promise<Response>
  delete(url: string): Promise<Response>
}

export class HttpError extends Error {
  constructor(public statusCode: number, public body: any) {
    super(`HTTP error - statusCode ${statusCode}`)
    this.name = "HttpError"
  }
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
  const call = (method: RequestInit['method']) => async (url: string, body?: unknown): Promise<Response> => {
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

    const res = await fetch(`${baseUrl}${url}`, requestOptions)

    if (res.status >= 400) {
      throw new HttpError(res.status, await res.json())
    }

    return res
  }

  return {
    get: call('GET'),
    post: call('POST'),
    put: call('PUT'),
    delete: call('DELETE'),
  }
}
