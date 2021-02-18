import boxen from 'boxen'
import chalk from 'chalk'
import clean from './actions/clean'
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

export const authenticateDemoAccount = async () => {
  console.log(TITLE)
  console.log(`DEBUG: ${global[GLOBAL_DEBUG_KEY]}`)
  try {
    const token = await BridalLiveAPI.authenticate(
      BL_DEMO_ACCT_RETAILER_ID,
      BL_DEMO_ACCT_API_KEY
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(token)
    if (!company || !token)
      throw new Error(
        `Failed to authenticate demo BridalLive account. Retailer ID: ${BL_DEMO_ACCT_RETAILER_ID}, API Key: ${BL_DEMO_ACCT_API_KEY}`
      )

    const demoAccountMsg = `${chalk.bold('BridalLive Demo Account')}\nStore: ${
      company.name
    }\nEmail: ${company.emailAddress}`
    const accountBox = `${TITLE} ${boxen(demoAccountMsg, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
    })}`
    console.log(accountBox)
    return token
  } catch (error) {
    logError(
      'Error occurred while authenticating BridalLive demo account',
      error
    )
    return null
  }
}

export const cleanDemoAccount = async () => {
  const token = await authenticateDemoAccount()
  if (token) clean(token)
}

export const populateDemoAccount = () => {
  console.log('populate')
}
