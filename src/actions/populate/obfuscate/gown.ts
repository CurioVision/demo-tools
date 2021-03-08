import { BridalLiveItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_GOWN_DEPT_ID,
  BL_DEMO_ACCT_TAX_CODE_ID,
} from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import { obfuscateBaseBridalLiveData } from './utils'

const StaticValues: Pick<
  BridalLiveItem,
  'taxCodeId' | 'departmentId' | 'isLinkedToMarketplace' | 'marketplaceId'
> = {
  taxCodeId: BL_DEMO_ACCT_TAX_CODE_ID,
  departmentId: BL_DEMO_ACCT_GOWN_DEPT_ID,
  isLinkedToMarketplace: null,
  marketplaceId: null,
}

const obfuscateGown = (demoData: BridalLiveDemoData, gown: BridalLiveItem) => {
  // replace any identifying values
  logInfo(`...obfuscating gown data`)
  gown = obfuscateBaseBridalLiveData(gown)

  // set new vendor id
  gown.vendorId = demoData.vendors[gown.vendorId].newId

  return {
    ...gown,
    ...StaticValues,
  }
}

export default obfuscateGown
