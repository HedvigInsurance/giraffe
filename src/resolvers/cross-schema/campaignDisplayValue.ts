import { IResolvers } from 'graphql-tools'

export const crossSchemaExtensions = `
    extend type Campaign {
        displayValue(locale: Locale!): String
    }
`

export const isFreeMonths = (
    incentive: any,
) => incentive.__typename === 'FreeMonths'
  
export const isVisibleNoDiscount = (
    incentive: any,
) => incentive.__typename === 'VisibleNoDiscount'
  
export const isMonthlyCostDeduction = (
    incentive: any,
) => incentive.__typename === 'MonthlyCostDeduction'
  
export const isNoDiscount = (
    incentive: any,
) => incentive.__typename === 'NoDiscount'
  
export const isPercentageDiscountMonths = (
    incentive: any,
) => incentive.__typename === 'PercentageDiscountMonths'

export default {
    displayValue: {
        fragment: `fragment CampaignCrossSchemaFragment on Campaign {
            owner {
                displayName
            }
            incentive {
                ... on FreeMonths {
                    quantity
                }
                ... on MonthlyCostDeduction {
                    amount {
                        amount
                        currency
                    }
                }
                ... on PercentageDiscountMonths {
                    percentageDiscount
                    percentageNumberOfMonths: quantity
                }
                ... on IndefinitePercentageDiscount {
                    percentageDiscount
                }
                ... on VisibleNoDiscount {
                    _
                }
            }
        }`,
        resolve: (
          campaign: any,
          args: any
        ) => {
            if (!campaign) {
                return null
            }

            const textKeyMap = require(`${__dirname}/../../translations/${args.locale}.json`)
            const incentive = campaign.incentive

            if (!incentive || isNoDiscount(incentive)) {
              return null
            }
          
            if (isVisibleNoDiscount(incentive)) {
              return textKeyMap["GENERIC_CAMPAIGN_ADDEDPERK"]
                .replace("{CAMPAIGN_NAME}", campaign.owner.displayName)
            }
          
            if (isFreeMonths(incentive)) {
                return textKeyMap["VOUCHER_ADDEDPERK"]
                    .replace("{FREE_MONTHS}", incentive.quantity)
                    .replace("{CAMPAIGN_NAME}", campaign.owner.displayName)
            }
          
            if (isMonthlyCostDeduction(incentive)) {
                return textKeyMap["REFERRAL_ADDEDPERK"]
                    .replace(
                        "{REFERRAL_VALUE}",
                        new Intl.NumberFormat(
                            args.locale.replace("_", "-"),
                            { style: 'currency', currency: incentive.amount.currency }
                        ).format(incentive.amount.amount)
                    )
            }
          
            if (isPercentageDiscountMonths(incentive)) {
                return textKeyMap["PERCENTAGE_DISCOUNT_MONTHS_ADDEDPERK"]
                    .replace("{PERCENTAGE}", incentive.percentageDiscount)
                    .replace("{QUANTITY}", incentive.percentageNumberOfMonths)
            }
        
            return campaign.owner.displayName
        },
      }
} as IResolvers