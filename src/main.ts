import boxen from 'boxen'
import chalk from 'chalk'
import clean from './actions/clean2'
import fetchCustomerData from './actions/fetchCustomerData'
import populate from './actions/populate'
import BridalLiveAPI from './integrations/BridalLive/api'
import { logError, logSevereError } from './logger'
import {
  BL_DEMO_ACCTS,
  BL_QA_ROOT_URL,
  DemoAccountSettings,
  GLOBAL_DEBUG_KEY,
  VALID_CUSTOMERS,
  VALID_DEMO_ACCOUNTS,
} from './settings'

const TITLE =
  '\n' +
  ' _                      _           \n' +
  '|~) _. _| _ || .   _   |~\\ _  _ _  _\n' +
  '|_)| |(_|(_|||_|\\/(/_  |_/(/_| | |(_)\n'

let demoAccountToken = undefined

export const authenticateDemoAccount = async (
  demoSettings: DemoAccountSettings
) => {
  if (demoAccountToken !== undefined) return

  console.log(TITLE)
  console.log(`DEBUG: ${global[GLOBAL_DEBUG_KEY]}`)
  try {
    const _token = await BridalLiveAPI.authenticate(
      BL_QA_ROOT_URL,
      demoSettings.retailerId,
      demoSettings.apiKey
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(
      BL_QA_ROOT_URL,
      _token
    )
    if (!company || !_token)
      throw new Error(
        `Failed to authenticate demo BridalLive account. Retailer ID: ${demoSettings.retailerId}, API Key: ${demoSettings.apiKey}`
      )

    const demoAccountMsg = `${chalk.bold('BridalLive Demo Account')}\nStore: ${
      company.name
    }\nEmail: ${company.emailAddress}`
    const accountBox = `${boxen(demoAccountMsg, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
    })}`
    console.log(accountBox)
    demoAccountToken = _token
  } catch (error) {
    logError(
      'Error occurred while authenticating BridalLive demo account',
      error
    )
    demoAccountToken = undefined
  }
}

export const cleanDemoAccount = async (
  demoAccountKey: VALID_DEMO_ACCOUNTS,
  vendor: number | 'all'
) => {
  const demoSettings = BL_DEMO_ACCTS[demoAccountKey]
  if (demoSettings) {
    await authenticateDemoAccount(demoSettings)
    if (demoAccountToken) await clean(demoAccountToken, demoSettings, vendor)
  } else {
    logSevereError(`Invalid demo key specified`, {
      demoAccountKey: demoAccountKey,
    })
  }
}

export const populateDemoAccount = async (
  demoAccountKey: VALID_DEMO_ACCOUNTS,
  customer: VALID_CUSTOMERS | 'all',
  vendor: number | 'all'
) => {
  const demoSettings = BL_DEMO_ACCTS[demoAccountKey]
  if (demoSettings) {
    await authenticateDemoAccount(demoSettings)
    if (demoAccountToken)
      await populate(demoAccountToken, demoSettings, customer, vendor)
  } else {
    logSevereError(`Invalid demo key specified`, {
      demoAccountKey: demoAccountKey,
    })
  }
}

export const fetch = async (customer: VALID_CUSTOMERS | 'all') => {
  if (customer === 'all') {
    logSevereError('Fetch ALL customers not yet implemented', {})
  }
  await fetchCustomerData(customer as VALID_CUSTOMERS)
}
