import boxen from 'boxen'
import chalk from 'chalk'
import clean from './actions/clean'
import fetchCustomerData from './actions/fetchCustomerData'
import BridalLiveAPI from './integrations/BridalLive/api'
import { logError } from './logger'
import {
  BL_DEMO_ACCT_API_KEY,
  BL_DEMO_ACCT_RETAILER_ID,
  BL_QA_ROOT_URL,
  GLOBAL_DEBUG_KEY,
} from './settings'

const TITLE =
  '\n' +
  ' _                      _           \n' +
  '|~) _. _| _ || .   _   |~\\ _  _ _  _\n' +
  '|_)| |(_|(_|||_|\\/(/_  |_/(/_| | |(_)\n'

let demoAccountToken = undefined

export const authenticateDemoAccount = async () => {
  if (demoAccountToken !== undefined) return

  console.log(TITLE)
  console.log(`DEBUG: ${global[GLOBAL_DEBUG_KEY]}`)
  try {
    const _token = await BridalLiveAPI.authenticate(
      BL_QA_ROOT_URL,
      BL_DEMO_ACCT_RETAILER_ID,
      BL_DEMO_ACCT_API_KEY
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(
      BL_QA_ROOT_URL,
      _token
    )
    if (!company || !_token)
      throw new Error(
        `Failed to authenticate demo BridalLive account. Retailer ID: ${BL_DEMO_ACCT_RETAILER_ID}, API Key: ${BL_DEMO_ACCT_API_KEY}`
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

export const cleanDemoAccount = async () => {
  await authenticateDemoAccount()
  if (demoAccountToken) await clean(demoAccountToken)
}

export const fetch = async () => {
  await fetchCustomerData()
}
