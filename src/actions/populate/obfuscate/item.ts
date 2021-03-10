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
  dataIdInDemo,
  dataWasAddedToDemo,
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

const obfuscateItem = (demoData: BridalLiveDemoData, item: BridalLiveItem) => {
  if (!dataWasAddedToDemo(demoData, 'vendors', item.vendorId)) {
    logInfo(`...no corresponding Vendor was created in demo data`)
    return null
  }
  logInfo(`...Item has corresponding Vendor in demo data`)

  // replace any identifying values
  logInfo(`...obfuscating Item data`)
  item = obfuscateBaseBridalLiveData(item)

  // set new vendor id
  item.vendorId = dataIdInDemo(demoData, 'vendors', item.vendorId)

  // set the department to Bridal Gowns or Other
  if (isCustomerGownDepartmentId(item.departmentId)) {
    item.departmentId = BL_DEMO_ACCT_GOWN_DEPT_ID
    item.departmentCode = BL_DEMO_ACCT_GOWN_DEPT_CODE
  } else {
    item.departmentId = BL_DEMO_ACCT_OTHER_DEPT_ID
    item.departmentCode = BL_DEMO_ACCT_OTHER_DEPT_CODE
  }

  return {
    ...item,
    ...StaticValues,
  }
}

export default obfuscateItem
