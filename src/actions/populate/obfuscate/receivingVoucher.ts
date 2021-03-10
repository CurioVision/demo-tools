import { DataWithLineItems } from '..'
import {
  BridalLiveReceivingVoucher,
  BridalLiveReceivingVoucherItem,
} from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_DEMO_ACCT_EMPLOYEE_NAME,
} from '../../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLiveReceivingVoucherItems,
} from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

const StaticValues: Pick<
  BridalLiveReceivingVoucher,
  | 'employeeId'
  | 'employeeName'
  | 'qbTxnId'
  | 'qboExportDateTime'
  | 'qbEditSequence'
  | 'invoiceNumber'
> = {
  employeeId: BL_DEMO_ACCT_EMPLOYEE_ID,
  employeeName: BL_DEMO_ACCT_EMPLOYEE_NAME,
  qbTxnId: null,
  qbEditSequence: null,
  qboExportDateTime: null,
  invoiceNumber: 'BridalVision',
}

const obfuscateReceivingVoucher = (
  demoData: BridalLiveDemoData,
  originalReceivingVoucherId: string,
  receivingVoucher: BridalLiveReceivingVoucher,
  allLineItems: MappedBridalLiveReceivingVoucherItems
): DataWithLineItems => {
  // skip the receiving voucher if the vendor wasn't imported
  if (!dataWasAddedToDemo(demoData, 'vendors', receivingVoucher.vendorId)) {
    logInfo(
      `...the Vendor for this Receiving Voucher was NOT created in demo data`
    )
    return null
  }

  // find associated line items
  const lineItems: BridalLiveReceivingVoucherItem[] = Object.values(
    allLineItems
  ).filter(
    (rvLineItem: BridalLiveReceivingVoucherItem) =>
      rvLineItem.receivingVoucherId.toString() === originalReceivingVoucherId
  )

  // if none of the lineItems are for gowns that were imported into the demo
  // account, return null so this PO doesn't get imported
  const shouldImport = lineItems.find((rvLineItem) =>
    dataWasAddedToDemo(demoData, 'items', rvLineItem.inventoryItemId)
  )
  if (!shouldImport) {
    logInfo(
      `...none of the Line Items map to corresponding Items that were created in demo data`
    )
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating receiving voucher data`)
  receivingVoucher = obfuscateBaseBridalLiveData(receivingVoucher)

  // obfuscate dates
  receivingVoucher.receiveDate = obfuscateDateAsBridalLiveString(
    receivingVoucher.receiveDate
  )
  receivingVoucher.invoiceDate = obfuscateDateAsBridalLiveString(
    receivingVoucher.invoiceDate
  )

  // set new vendor id
  receivingVoucher.vendorId = dataIdInDemo(
    demoData,
    'vendors',
    receivingVoucher.vendorId
  )

  return {
    parentData: {
      ...receivingVoucher,
      ...StaticValues,
    },
    lineItems: lineItems,
  }
}

export default obfuscateReceivingVoucher
