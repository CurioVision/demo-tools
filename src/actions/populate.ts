import boxen from 'boxen'
import chalk from 'chalk'
import BridalLiveAPI from '../integrations/BridalLive/api'
import {
  BridalLiveApiCredentials,
  BridalLiveToken,
} from '../integrations/BridalLive/apiTypes'
import { logError, logInfo } from '../logger'
import { BL_CUSTOMER_ACCTS } from '../settings'

const populateBridalLiveDemoAccount = async (
  demoAccountToken: BridalLiveToken
) => {
  try {
    const customerToken = await authenticateCustomerAccount(
      BL_CUSTOMER_ACCTS[0]
    )
    if (customerToken) {
      logInfo('Got customer token')
    }
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

export const authenticateCustomerAccount = async (
  customer: BridalLiveApiCredentials
) => {
  try {
    const customerToken = await BridalLiveAPI.authenticate(
      customer.retailerId,
      customer.apiKey
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(customerToken)
    if (!company || !customerToken)
      throw new Error(
        `Failed to authenticate customer BridalLive account. Retailer ID: ${customer.retailerId}, API Key: ${customer.apiKey}`
      )

    const customerAccountMsg = `${chalk.bold(
      'BridalLive Customer Account'
    )}\nStore: ${company.name}\nEmail: ${company.emailAddress}`
    const accountBox = `${boxen(customerAccountMsg, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
    })}`
    console.log(accountBox)
    return customerToken
  } catch (error) {
    logError(
      'Error occurred while authenticating Customer BridalLive account',
      error
    )
    return undefined
  }
}

export const fetchAllDataFromCustomer = async (customerToken: string) => {}

export default populateBridalLiveDemoAccount
