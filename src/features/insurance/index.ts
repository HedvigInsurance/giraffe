import { getInsurance, getUser } from '../../api'
import * as config from '../../config'
import { ForwardHeaders } from '../../context'
import { Insurance } from '../../typings/generated-graphql-types'

const loadInsurance = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Insurance> => {
  const [insuranceObject, user] = await Promise.all([
    getInsurance(config.BASE_URL, headers)(token),
    getUser(config.BASE_URL, headers)(token),
  ])
  return {
    insuredAtOtherCompany: insuranceObject.insuredAtOtherCompany,
    personsInHousehold: insuranceObject.personsInHousehold,
    currentInsurerName: insuranceObject.currentInsurerName,
    policyUrl: insuranceObject.policyUrl,
    presaleInformationUrl: insuranceObject.presaleInformationUrl,
    monthlyCost: insuranceObject.currentTotalPrice,
    address: insuranceObject.addressStreet,
    certificateUrl: insuranceObject.certificateUrl,
    status: insuranceObject.status,
    type: insuranceObject.insuranceType,
    activeFrom: insuranceObject.activeFrom,
    perilCategories: insuranceObject.categories,
    safetyIncreasers: user.safetyIncreasers,
  }
}

export { loadInsurance }
