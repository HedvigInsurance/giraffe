import { IResolvers } from 'graphql-tools'
import { Table, TableSection } from './table'
import { TableRenderer } from './tableRenderer'

export const crossSchemaExtensions = `
    type TableRow {
      title: String!
      subtitle: String
      value: String!
    }

    type TableSection {
      title: String!
      rows: [TableRow!]!
    }

    type Table {
      title: String!
      sections: [TableSection!]!
    }

    extend type CompleteQuote {
        detailsTable(locale: Locale!): Table!
    }
    
    extend type BundledQuote {
        detailsTable(locale: Locale!): Table!
    }
`

export default (fragment: string) => ({
  detailsTable: {
    fragment,
    resolve: (
      quote: any,
      args: any
    ) => createTable(quote, args),
  },
} as IResolvers)

const createTable = (quote: any, args: any): Table => {
  const renderer = new TableRenderer(args.locale)

  const sections: Record<string, TableSection> = {
    "details": {
      title: renderer.textKeyMap["DETAILS_TABLE_DETAILS_SECTION_TITLE"],
      rows: renderer.mapDetailRows(quote.quoteDetails)
    },
    "extraBuildings": {
      title: renderer.textKeyMap["DETAILS_TABLE_EXTRA_BUILDING_SECTION_TITLE"],
      rows: renderer.mapExtraBuildingRows(quote.quoteDetails.extraBuildings)
    }
  }

  return ({
    title: renderer.textKeyMap[`CONTRACT_DISPLAY_NAME_${quote.typeOfContract}`],
    sections: Object.keys(sections).map(key => sections[key]).filter(section => section.rows.length > 0)
  }) as Table
}