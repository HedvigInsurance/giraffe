import { Server } from 'http'
import * as Koa from 'koa'
import { createContextfulHttpClient } from './httpClient'

describe('HttpClient tests', () => {
  const app = new Koa()
  let server: Server

  beforeAll(() => (server = app.listen(3000)))
  afterAll((callback) => server.close(callback))

  interface PreparedResponse {
    method: string
    path: string
    status: number
    output: any
  }

  const preparedResponses: PreparedResponse[] = [
    {
      method: 'GET',
      path: '/get-test',
      status: 200,
      output: {
        result: 'TEST',
      },
    },
    {
      method: 'POST',
      path: '/post-test',
      status: 200,
      output: {
        result: 'TEST2',
      },
    },
    {
      method: 'GET',
      path: '/fail-test',
      status: 400,
      output: {
        result: 'FAIL',
      },
    },
  ]
  app.use((ctx) => {
    const output = preparedResponses.find(
      (pr) => pr.method === ctx.request.method && pr.path === ctx.request.path,
    )!
    ctx.status = output.status
    ctx.body = output.output
  })

  const client = createContextfulHttpClient(
    'http://localhost:3000',
    () => 'token',
    {},
  )

  it('Can GET', async () => {
    const result = await client.get('/get-test')

    expect(await result.json()).toEqual({ result: 'TEST' })
  })

  it('Can POST', async () => {
    const result = await client.post('/post-test', {})

    expect(await result.json()).toEqual({ result: 'TEST2' })
  })

  it('Fails with error', async () => {
    const result = client.get('/fail-test')

    expect(result).rejects.toThrowError()
  })

  it('Does not fail if status code is overridden', async () => {
    const result = await client.get('/fail-test', { validStatusCodes: [400] })

    expect(await result.json()).toEqual({ result: 'FAIL' })
  })
})
