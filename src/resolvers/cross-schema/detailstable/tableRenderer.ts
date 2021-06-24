import { TableRow } from './table'

export class TableRenderer {

    textKeyMap: any
    private labelMap: Record<string, string>
    private valueRenderer: Record<string, (value: any) => string>

    constructor(locale: String) {
        this.textKeyMap = require(`${__dirname}/../../../translations/${locale}.json`)

        this.labelMap = {
            "coInsured": this.textKeyMap["DETAILS_TABLE_COINSURED_LABEL"],
            "street": this.textKeyMap["DETAILS_TABLE_STREET_LABEL"],
            "zipCode": this.textKeyMap["DETAILS_TABLE_ZIP_CODE_LABEL"],
            "householdSize": this.textKeyMap["DETAILS_TABLE_COINSURED_LABEL"],
            "city": this.textKeyMap["DETAILS_TABLE_CITY_LABEL"],
            "livingSpace": this.textKeyMap["DETAILS_TABLE_LIVING_SPACE_LABEL"],
            "swedishApartmentType": this.textKeyMap["DETAILS_TABLE_SWEDISH_APARTMENT_TYPE_LABEL"],
            "norwegianHomeContentType": this.textKeyMap["DETAILS_TABLE_NORWEGIAN_HOME_CONTENT_TYPE_LABEL"],
            "danishHomeContentType": this.textKeyMap["DETAILS_TABLE_DANISH_HOME_CONTENT_TYPE_LABEL"],
            "ancillaryArea": this.textKeyMap["DETAILS_TABLE_ANCILLARY_SPACE_LABEL"],
            "numberOfBathrooms": this.textKeyMap["DETAILS_TABLE_NUMBER_OF_BATHROOMS_LABEL"],
            "yearOfConstruction": this.textKeyMap["DETAILS_TABLE_YEAR_OF_CONSTRUCTION_LABEL"],
            "isSubleted": this.textKeyMap["DETAILS_TABLE_IS_SUBLETED_LABEL"]
        }

        this.valueRenderer = {
            "coInsured": (coInsured) =>
                this.textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", coInsured),
            "street": (street) => street,
            "zipCode": (postalCode) => postalCode,
            "householdSize": (householdSize) =>
                this.textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", householdSize - 1),
            "city": (city) => city,
            "livingSpace": (livingSpace) => `${livingSpace} m2`,
            "ancillaryArea": (livingSpace) => `${livingSpace} m2`,
            "swedishApartmentType": (swedishApartmentType) => this.textKeyMap[`DETAILS_TABLE_SWEDISH_APARTMENT_TYPE_${swedishApartmentType}_VALUE`],
            "danishHomeContentType": (danishHomeContentType) => this.textKeyMap[`DETAILS_TABLE_DANISH_HOME_CONTENT_TYPE_${danishHomeContentType}_VALUE`],
            "norwegianHomeContentType": (norwegianHomeContentType) => this.textKeyMap[`DETAILS_TABLE_NORWEGIAN_HOME_CONTENT_TYPE_${norwegianHomeContentType}_VALUE`],
            "numberOfBathrooms": (numberOfBathrooms) => String(numberOfBathrooms),
            "yearOfConstruction": (yearOfConstruction) => String(yearOfConstruction),
            "isSubleted": (isSubleted) => isSubleted ? this.textKeyMap["DETAILS_TABLE_IS_SUBLETED_YES_VALUE"] : this.textKeyMap["DETAILS_TABLE_IS_SUBLETED_NO_VALUE"]
        }
    }

    mapDetailRows = (query: any): TableRow[] => Object.keys(query).map(key => {
        let labelMapValue = this.labelMap[key]

        if (!labelMapValue) {
            return null
        }

        return ({
            title: labelMapValue,
            subtitle: null,
            value: String(this.valueRenderer[key](query[key]))
        })
    }).filter(value => value) as TableRow[]

    mapExtraBuildingRows = (query: any): TableRow[] => (query || []).map((extraBuilding: any) => ({
        title: extraBuilding.displayName ?? "",
        subtitle: extraBuilding.hasWaterConnected ? this.textKeyMap["DETAILS_TABLE_EXTRA_BUILDING_HAS_WATER_CONNECTED_SUBTITLE"] : null,
        value: `${extraBuilding.area} m2`
    }))

}



