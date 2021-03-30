
import fetch, { RequestInit, Response } from 'node-fetch'

/**
 * A client that can perform upstream HTTP calls.
 */
export interface HttpClient {
  get(url: string): Promise<Response>
  post(url: string, body: any): Promise<Response>
  put(url: string, body: any): Promise<Response>
  delete(url: string): Promise<Response>
}

/**
 * Create a HttpClient that comes with a pre-packaged base-url,
 * auth token and headers.
 */
export const createContextfulHttpClient = (
  baseUrl: string,
  token: string,
  forwardHeaders: { [key: string]: string }
): HttpClient => {
  const call = async (url: string, method: string, body: any | undefined = undefined): Promise<Response> => {
    const headers: { [key: string]: string } = {
      ...forwardHeaders,
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    const requestOptions: RequestInit = {
      method: method,
      body: body !== undefined ? JSON.stringify(body) : body,
      headers: headers,
    }

    const res = await fetch(`${baseUrl}${url}`, requestOptions)

    if (res.status >= 400) { // TODO: include custom status validation when needed
      throw new Error(
        `API error - status: ${res.status}, body: ${JSON.stringify(await res.text(), null, 4)}`
      )
    }

    return res
  }

  return {
    get: (url) => call(url, "GET"),
    post: (url, body) => call(url, "POST", body),
    put: (url, body) => call(url, "PUT", body),
    delete: (url) => call(url, "DELETE"),
  }
}