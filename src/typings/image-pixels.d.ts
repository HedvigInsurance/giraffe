declare module 'image-pixels' {
  function pixels(src: Buffer): { data: Uint8ClampedArray, width: number, height: number }
  export = pixels
}
