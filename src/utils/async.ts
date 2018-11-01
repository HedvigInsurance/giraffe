export const awaitAll = async (
  ...args: Array<Promise<any> | undefined>
): Promise<void> => {
  await Promise.all(
    args.map((p) => (p ? p : (Promise.resolve() as Promise<any>))),
  )
}
