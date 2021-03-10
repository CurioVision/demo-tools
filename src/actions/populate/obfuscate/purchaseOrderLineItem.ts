import { BridalLivePurchaseOrderItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo, logWarning } from '../../../logger'
import { BL_DEMO_ACCT_CONTACT_ID } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import { dataWasAddedToDemo, obfuscateBaseBridalLiveData } from './utils'

const StaticValues = {}

const obfuscatePurchaseOrderLineItem = (
  demoData: BridalLiveDemoData,
  lineItem: BridalLivePurchaseOrderItem
) => {
  // if no purchase order was imported into the demo account, return null so
  // this line item doesn't get imported
  if (
    !dataWasAddedToDemo(demoData, 'purchaseOrders', lineItem.purchaseOrderId)
  ) {
    logInfo(
      `...no corresponding Purchase Order was created in demo data for original ID: ${lineItem.purchaseOrderId}`
    )
    return null
  }

  logInfo(`...Line Item has corresponding Purchase Order in demo data`)

  const originalGownId = lineItem.inventoryItemId
  if (!dataWasAddedToDemo(demoData, 'items', originalGownId)) {
    logWarning(
      `...Line Item has NO corresponding Item in demo data.
      \tORIGINAL ITEM ID: ${originalGownId},
      \tORIGINAL ITEM NAME: ${lineItem.itemVendorItemName}`
    )
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating purchase order line item data`)
  lineItem = obfuscateBaseBridalLiveData(lineItem)

  // set the new purchase order id
  lineItem.purchaseOrderId =
    demoData.purchaseOrders[lineItem.purchaseOrderId].newId

  lineItem.itemNumber = demoData.items[originalGownId].cleanData.itemNumber

  // only obfuscate contact data if it was already set
  if (lineItem.contactId) lineItem.contactId = BL_DEMO_ACCT_CONTACT_ID

  // set new related item data using the gown that was created in the demo account
  lineItem.inventoryItemId = demoData.items[originalGownId].newId

  return {
    ...lineItem,
    ...StaticValues,
  }
}

export default obfuscatePurchaseOrderLineItem
