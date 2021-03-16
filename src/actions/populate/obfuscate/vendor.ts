import { BridalLiveVendor } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import { obfuscateBaseBridalLiveData } from './utils'

const StaticValues: Pick<
  BridalLiveVendor,
  'marketplaceId' | 'accountNumber'
> = {
  marketplaceId: null,
  accountNumber: null,
}

const obfuscateVendor = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
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
