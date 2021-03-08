import { BridalLiveVendor } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { BridalLiveDemoData } from '../../../types'
import { obfuscateBaseBridalLiveData } from './utils'

const StaticValues: Pick<BridalLiveVendor, 'marketplaceId'> = {
  marketplaceId: null,
}

const obfuscateVendor = (
  demoData: BridalLiveDemoData,
  vendor: BridalLiveVendor
) => {
  // replace any identifying values
  logInfo(`...obfuscating vendor data`)
  vendor = obfuscateBaseBridalLiveData(vendor)
  return {
    ...vendor,
    ...StaticValues,
  }
}

export default obfuscateVendor
