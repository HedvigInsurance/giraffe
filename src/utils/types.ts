
/**
 * `Typenamed` is an intersection type between its first type argument `T`, and an
 * object that has the second type argument `N` set on a `__typename` property.
 * 
 * Our GraphQL typescript codegen does not support adding a `__typename` constraint
 * to its types (which it should), and since it doesn't, we sometimes need to use this
 * in order to make Typescript accept our object literals.
 * 
 * Example:
 * ```typescript
 * // Generated from GraphQL schema
 * type PossibleTemperatureTypeNames = 'Centigrades' | 'Farenheit'
 * 
 * type Tempterature = Centigrades | Farenheit
 * 
 * interface Centigrades {
 *   centigrades: number
 * }
 * 
 * interface Farenheit {
 *   farenheit: number
 * }
 * 
 * // And then later we try
 * const temp: Tempterature = {
 *   __typename: 'Centrigrades', // required by GraphQL, but not accepted by typescript as object literal
 *   centrigrates: 25
 * }
 * 
 * // Solution
 * const temp: Typenamed<Tempterature, PossibleTemperatureTypeNames> = {
 *   __typename: 'Centrigrades', // Works!
 *   centrigrates: 25
 * }
 * ``` 
 */
export type Typenamed<T, N> = T & { __typename: N }
