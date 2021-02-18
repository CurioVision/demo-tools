import boxen from 'boxen'
import chalk from 'chalk'
import clean from './actions/clean'
import populate from './actions/populate'
import BridalLiveAPI from './integrations/BridalLive/api'
import { logError } from './logger'
import {
  BL_DEMO_ACCT_API_KEY,
  BL_DEMO_ACCT_RETAILER_ID,
  GLOBAL_DEBUG_KEY,
} from './settings'

const TITLE =
  '\n' +
  ' _                      _           \n' +
  '|~) _. _| _ || .   _   |~\\ _  _ _  _\n' +
  '|_)| |(_|(_|||_|\\/(/_  |_/(/_| | |(_)\n'

let authenticatedToken = undefined

export const authenticateDemoAccount = async () => {
  if (authenticatedToken !== undefined) return

  console.log(TITLE)
  console.log(`DEBUG: ${global[GLOBAL_DEBUG_KEY]}`)
  try {
    const _token = await BridalLiveAPI.authenticate(
      BL_DEMO_ACCT_RETAILER_ID,
      BL_DEMO_ACCT_API_KEY
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(_token)
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
    authenticatedToken = _token
  } catch (error) {
    logError(
      'Error occurred while authenticating BridalLive demo account',
      error
    )
    authenticatedToken = undefined
  }
}

export const cleanDemoAccount = async () => {
  await authenticateDemoAccount()
  if (authenticatedToken) await clean(authenticatedToken)
}

export const populateDemoAccount = async () => {
  await authenticateDemoAccount()
  if (authenticatedToken) await populate(authenticatedToken)
}
