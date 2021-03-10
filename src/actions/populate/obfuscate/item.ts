import { BridalLiveItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_GOWN_DEPT_CODE,
  BL_DEMO_ACCT_GOWN_DEPT_ID,
  BL_DEMO_ACCT_OTHER_DEPT_CODE,
  BL_DEMO_ACCT_OTHER_DEPT_ID,
  BL_DEMO_ACCT_TAX_CODE_ID,
} from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  isCustomerGownDepartmentId,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues: Pick<
  BridalLiveItem,
  'taxCodeId' | 'isLinkedToMarketplace' | 'marketplaceId'
> = {
  taxCodeId: BL_DEMO_ACCT_TAX_CODE_ID,
  isLinkedToMarketplace: null,
  marketplaceId: null,
}

const obfuscateItem = (demoData: BridalLiveDemoData, gown: BridalLiveItem) => {
  // replace any identifying values
  logInfo(`...obfuscating gown data`)
  gown = obfuscateBaseBridalLiveData(gown)

  // set new vendor id
  gown.vendorId = demoData.vendors[gown.vendorId].newId

  // set the department to Bridal Gowns or Other
  if (isCustomerGownDepartmentId(gown.departmentId)) {
    gown.departmentId = BL_DEMO_ACCT_GOWN_DEPT_ID
    gown.departmentCode = BL_DEMO_ACCT_GOWN_DEPT_CODE
  } else {
    gown.departmentId = BL_DEMO_ACCT_OTHER_DEPT_ID
    gown.departmentCode = BL_DEMO_ACCT_OTHER_DEPT_CODE
  }

  return {
    ...gown,
    ...StaticValues,
  }
}

export default obfuscateItem
