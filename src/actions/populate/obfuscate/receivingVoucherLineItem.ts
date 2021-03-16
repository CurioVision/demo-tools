import { BridalLiveReceivingVoucherItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo, logWarning } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import { dataWasAddedToDemo, obfuscateBaseBridalLiveData } from './utils'

const StaticValues: Pick<
  BridalLiveReceivingVoucherItem,
  | 'contactHomePhoneNumber'
  | 'contactMobilePhoneNumber'
  | 'contactWorkPhoneNumber'
> = {
  contactHomePhoneNumber: null,
  contactMobilePhoneNumber: null,
  contactWorkPhoneNumber: null,
}

const obfuscateReceivingVoucherLineItem = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  lineItem: BridalLiveReceivingVoucherItem
) => {
  console.log(demoData.receivingVouchers[lineItem.receivingVoucherId])
  // if no receiving voucher was imported into the demo account, return null so
  // this line item doesn't get imported
  if (
    !dataWasAddedToDemo(
      demoData,
      'receivingVouchers',
      lineItem.receivingVoucherId
    )
  ) {
    logInfo(
      `...no corresponding Receiving Voucher was created in demo data for original ID: ${lineItem.receivingVoucherId}`
    )
    return null
  }

  logInfo(`...Line Item has corresponding Purchase Order in demo data`)

  const originalItemId = lineItem.inventoryItemId
  if (!dataWasAddedToDemo(demoData, 'items', originalItemId)) {
    logWarning(
      `...Line Item has NO corresponding Item in demo data.
      \tORIGINAL ITEM ID: ${originalItemId},
      \tORIGINAL ITEM NAME: ${lineItem.itemVendorItemName}`
    )

    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating receiving voucher line item data`)
  lineItem = obfuscateBaseBridalLiveData(lineItem)

  const originalPurchaseOrderId = lineItem.purchaseOrderId
  const originalPurchaseOrderItemId = lineItem.purchaseOrderItemId
  const originalReceivingVoucherId = lineItem.receivingVoucherId

  // // set the new receiving voucher id
  lineItem.receivingVoucherId =
    demoData.receivingVouchers[originalReceivingVoucherId].newId
  // set new related item data using the gown that was created in the demo account
  lineItem.inventoryItemId = demoData.items[originalItemId].newId
  lineItem.itemNumber = demoData.items[originalItemId].cleanData.itemNumber
  // set new related RV and PO ids using created data in the demo account
  lineItem.purchaseOrderId =
    demoData.purchaseOrders[originalPurchaseOrderId].newId
  lineItem.purchaseOrderItemId =
    demoData.purchaseOrderItems[originalPurchaseOrderItemId].newId

  // only obfuscate contact data if it was already set
  if (lineItem.contactId) lineItem.contactId = demoSettings.contactId
  if (lineItem.contactName) lineItem.contactName = demoSettings.contactName

  return {
    ...lineItem,
    ...StaticValues,
  }
}

export default obfuscateReceivingVoucherLineItem
