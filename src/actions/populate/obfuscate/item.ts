import { BridalLiveItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  isCustomerGownDepartmentId,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues: Pick<
  BridalLiveItem,
  'isLinkedToMarketplace' | 'marketplaceId'
> = {
  isLinkedToMarketplace: null,
  marketplaceId: null,
}

const obfuscateItem = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  item: BridalLiveItem
) => {
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

  // set taxCodeId
  item.taxCodeId = demoSettings.taxCodeId // BL_DEMO_ACCT_TAX_CODE_ID,

  // set the department to Bridal Gowns or Other
  if (isCustomerGownDepartmentId(item.departmentId)) {
    item.departmentId = demoSettings.gownDeptId // BL_DEMO_ACCT_GOWN_DEPT_ID
    item.departmentCode = demoSettings.gownDeptCode // BL_DEMO_ACCT_GOWN_DEPT_CODE
  } else {
    item.departmentId = demoSettings.otherDeptId // BL_DEMO_ACCT_OTHER_DEPT_ID
    item.departmentCode = demoSettings.otherDeptCode // BL_DEMO_ACCT_OTHER_DEPT_CODE
  }

  return {
    ...item,
    ...StaticValues,
  }
}

export default obfuscateItem
