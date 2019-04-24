export const throwIfProd = (error: Error) => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  throw error
}
