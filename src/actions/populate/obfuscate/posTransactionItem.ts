import { BridalLivePosTransactionLineItem } from '../../../integrations/BridalLive/apiTypes'
import { logInfo, logWarning } from '../../../logger'
import { BL_DEMO_ACCT_TAX_CODE_ID } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues: Pick<BridalLivePosTransactionLineItem, 'taxCodeId'> = {
  taxCodeId: BL_DEMO_ACCT_TAX_CODE_ID,
}

const obfuscatePosTransactionLineItem = (
  demoData: BridalLiveDemoData,
  lineItem: BridalLivePosTransactionLineItem
) => {
  const originalTrxId = lineItem.transactionId
  // if no pos transaction was imported into the demo account, return null so
  // this line item doesn't get imported
  if (!dataWasAddedToDemo(demoData, 'posTransactions', originalTrxId)) {
    logInfo(
      `...no corresponding Pos Transaction was created in demo data for original ID: ${originalTrxId}`
    )
    return null
  }

  logInfo(`...Line Item has corresponding Pos Transaction in demo data`)

  const originalItemId = lineItem.inventoryItemId
  if (!dataWasAddedToDemo(demoData, 'items', originalItemId)) {
    logWarning(
      `...Line Item has NO corresponding Item in demo data.
      \tORIGINAL ITEM ID: ${originalItemId},
      \tORIGINAL ITEM NAME: ${lineItem.itemVendorItemName}`
    )
    return null
  }

  logInfo(`...Line Item has corresponding Item in demo data`)

  // if there is a related BridalLivePurchaseOrderItem, make sure it was added
  // to the demo data and update the ID accordingly
  if (lineItem.purchaseOrderItemId) {
    if (
      !dataWasAddedToDemo(
        demoData,
        'purchaseOrderItems',
        lineItem.purchaseOrderItemId
      )
    ) {
      logWarning(
        `...Line Item has a related Purchase Order Item, but the corresponding Purchase Order Item is NOT in demo data.
        \tORIGINAL PURCHASE ORDER ITEM ID: ${lineItem.purchaseOrderItemId}`
      )
      return null
    }

    logInfo(`...Line Item has corresponding Purchase Order Item in demo data`)
    lineItem.purchaseOrderItemId = dataIdInDemo(
      demoData,
      'purchaseOrderItems',
      lineItem.purchaseOrderItemId
    )
  }

  // replace any identifying values
  logInfo(`...obfuscating pos transaction line item data`)
  lineItem = obfuscateBaseBridalLiveData(lineItem)

  // set the new pos transaction id id
  lineItem.transactionId = dataIdInDemo(
    demoData,
    'posTransactions',
    originalTrxId
  )

  // set new related item data using the gown that was created in the demo account
  lineItem.inventoryItemId = dataIdInDemo(demoData, 'items', originalItemId)
  lineItem.itemNumber = demoData.items[originalItemId].cleanData.itemNumber

  return {
    ...lineItem,
    ...StaticValues,
  }
}

export default obfuscatePosTransactionLineItem
