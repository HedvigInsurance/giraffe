import { GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools'

export const crossSchemaExtensions = `
  extend type KeyGearItem {
    covered: [KeyGearItemCoverage!]!
    exceptions: [KeyGearItemCoverage!]!
  }
`

const getCoveredIds = (category: KeyGearItemCategory) => {
  return {
    [KeyGearItemCategory.PHONE]: [
      'ck6rz2hbic4fa0b75tk8aw4f6',
      'ck6rz3vh3c1mr0b2055n6y0b8',
      'ck6rz4qk9c1oy0b20eu7fasr4',
      'ck6rz57i1c4o30b75rinujn6v',
      'ck6rz5jz9c1qx0b20cwlsivp5',
    ],
    [KeyGearItemCategory.COMPUTER]: [
      'ck6rz8x9mc1xf0b20upfg8x4i',
      'ck6rz9f2wc1zm0b20m9ex3h8c',
      'ck6rzazt7c58q0b75anvxkp3n',
      'ck6rzbcujc2650b20ke183np2',
      'ck6rzbzckc27y0b20z3axcbt8',
    ],
    [KeyGearItemCategory.TV]: [
      'ck6rzddutc5j40b75e65i6egx',
      'ck6rzedmdc5n70b75bp382ckl',
      'ck6rzeuhvc2fx0b20e6hpikkn',
      'ck6rzf86hc5s10b75c2yhalsw',
    ],
    [KeyGearItemCategory.BICYCLE]: [
      'ck6rzgib1c2q10b20ctos0rt2',
      'ck6rzh304c6530b758ptd5wuu',
      'ck6rzhd2bc2uy0b200q3fz289',
      'ck6rzht2kc2xt0b20qyloq5hh',
    ],
    [KeyGearItemCategory.WATCH]: [
      'ck6rzjki1c7940b757invi3jb',
      'ck6rzjxmhc33m0b209zfx5e0u',
    ],
    [KeyGearItemCategory.JEWELRY]: [
      'ck6rzld4ic80e0b75ebn58utz',
      'ck6rzln3gc3og0b209k5nwz15',
    ],
  }[category]
}

const getExceptionIds = (category: KeyGearItemCategory) => {
  return {
    [KeyGearItemCategory.PHONE]: [
      'ck6rz60w6c1sf0b20nfj9nimg',
      'ck6rz6ietc1ta0b20l44c0irj',
    ],
    [KeyGearItemCategory.COMPUTER]: [
      'ck6rzco1wc5fn0b75acn4are8',
      'ck6rzczhnc5hp0b75ips3pyqu',
    ],
    [KeyGearItemCategory.TV]: [
      'ck6rzfmswc2kq0b20351aexv7',
      'ck6rzfzsyc5x40b7503pwcpvz',
    ],
    [KeyGearItemCategory.BICYCLE]: [
      'ck6rzi60sc2z50b2066qisb0u',
      'ck6rzio31c30q0b20wtku0rhm',
      'ck6rziz5lc31t0b208u7i599h',
    ],
    [KeyGearItemCategory.WATCH]: [
      'ck6rzkhmlc3cp0b20zv8dcvpp',
      'ck6rzkuwrc3j90b2088btgoll',
    ],
    [KeyGearItemCategory.JEWELRY]: [
      'ck6rzm4f5c83u0b75uis9jhha',
      'ck6rzmfxhc85e0b75odf6gpkq',
    ],
  }[category]
}

enum KeyGearItemCategory {
  PHONE = 'PHONE',
  COMPUTER = 'COMPUTER',
  TV = 'TV',
  BICYCLE = 'BICYCLE',
  WATCH = 'WATCH',
  JEWELRY = 'JEWELRY',
}

interface KeyGearItem {
  category: KeyGearItemCategory
}

export const getCrossSchemaResolvers = (
  graphcmsSchema: GraphQLSchema,
): IResolvers => {
  return {
    KeyGearItem: {
      covered: {
        fragment: `fragment KeyGearCrossSchemaFragment on KeyGearItem { category }`,
        resolve: (keyGearItem: KeyGearItem, _args, context, info) => {
          return info.mergeInfo.delegateToSchema({
            schema: graphcmsSchema,
            operation: 'query',
            fieldName: 'keyGearItemCoverages',
            args: {
              where: {
                id_in: getCoveredIds(keyGearItem.category),
              },
            },
            context,
            info,
          })
        },
      },
      exceptions: {
        fragment: `fragment KeyGearCrossSchemaFragment on KeyGearItem { category }`,
        resolve: (keyGearItem: KeyGearItem, _args, context, info) => {
          return info.mergeInfo.delegateToSchema({
            schema: graphcmsSchema,
            operation: 'query',
            fieldName: 'keyGearItemCoverages',
            args: {
              where: {
                id_in: getExceptionIds(keyGearItem.category),
              },
            },
            context,
            info,
          })
        },
      },
    },
  }
}
