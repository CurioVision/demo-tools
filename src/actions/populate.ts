import { BridalLiveToken } from '../integrations/BridalLive/apiTypes'
import { logError, logHeader } from '../logger'

const populateBridalLiveDemoAccount = async (token: BridalLiveToken) => {
  logHeader(`Populating BridalLive Demo account`)
  try {
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

export default populateBridalLiveDemoAccount
