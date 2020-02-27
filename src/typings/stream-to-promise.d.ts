declare module 'stream-to-promise' {
  function streamToPromise(stream: ReadableStream | WritableStream): Promise<Buffer>

  export = streamToPromise
}
