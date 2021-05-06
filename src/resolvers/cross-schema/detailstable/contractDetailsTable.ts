import { IResolvers } from 'graphql-tools'
import { upcomingAgreementChangeFragment, currentAgreementFragment } from './contractDetailsFragments'
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

    extend type Contract {
        currentAgreementDetailsTable(locale: Locale!): Table!
        upcomingAgreementDetailsTable(locale: Locale!): Table!
    }
`

export const currentAgreementDetailsTable = () => ({
  currentAgreementDetailsTable: {
    fragment: currentAgreementFragment,
    resolve: (
      contract: any,
      args: any
    ) => createTable(contract.currentAgreement, args),
  },
} as IResolvers)

export const upcomingAgreementDetailsTable = () => ({
  upcomingAgreementDetailsTable: {
    fragment: upcomingAgreementChangeFragment,
    resolve: (
      contract: any,
      args: any
    ) => {
      if (contract.status.upcomingAgreementChange != null) {
        return createTable(contract.status.upcomingAgreementChange.newAgreement, args)
      } else {
        return ({ title: "", sections:[] as TableSection[] }) as Table
      }
    }
  },
} as IResolvers)

const createTable = (agreement: any, args: any): Table => {
  
  const renderer = new TableRenderer(args.locale)

  const sections: Record<string, TableSection> = {
    "details": {
      title: renderer.textKeyMap["DETAILS_TABLE_DETAILS_SECTION_TITLE"],
      rows: renderer.mapDetailRows(agreement.address).concat(renderer.mapDetailRows(agreement))
    },
    "extraBuildings": {
      title: renderer.textKeyMap["DETAILS_TABLE_EXTRA_BUILDING_SECTION_TITLE"],
      rows: renderer.mapExtraBuildingRows(agreement.extraBuildings)
    }
  }

  return ({
    title: "",
    sections: Object.keys(sections).map(key => sections[key]).filter(section => section.rows.length > 0)
  }) as Table
}
