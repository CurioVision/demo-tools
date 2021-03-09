import {
  BridalLivePurchaseOrder,
  BridalLivePurchaseOrderItem,
} from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_CONTACT_ID,
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_DEMO_ACCT_EMPLOYEE_NAME,
} from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import { obfuscateBaseBridalLiveData } from './utils'

const StaticValues: Pick<
  BridalLivePurchaseOrder,
  | 'employeeId'
  | 'employeeName'
  | 'eventDate'
  | 'eventContactId'
  | 'eventContactName'
  | 'purchaseOrderNumber'
> = {
  employeeId: BL_DEMO_ACCT_EMPLOYEE_ID,
  employeeName: BL_DEMO_ACCT_EMPLOYEE_NAME,
  eventDate: null,
  eventContactId: null,
  eventContactName: null,
  purchaseOrderNumber: null,
}

const obfuscatePurchaseOrderLineItem = (
  demoData: BridalLiveDemoData,
  lineItem: BridalLivePurchaseOrderItem
) => {
  console.log(demoData.purchaseOrders[lineItem.purchaseOrderId])
  // if no purchase order was imported into the demo account, return null so
  // this line item doesn't get imported
  if (
    !demoData.purchaseOrders.hasOwnProperty(lineItem.purchaseOrderId) ||
    !demoData.purchaseOrders[lineItem.purchaseOrderId].newId
  ) {
    logInfo(
      `...no corresponding Purchase Order was created in demo data for original ID: ${lineItem.purchaseOrderId}`
    )
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating purchase order line item data`)
  lineItem = obfuscateBaseBridalLiveData(lineItem)

  const originalGownId = lineItem.inventoryItemId
  // // set the new purchase order id
  lineItem.purchaseOrderId =
    demoData.purchaseOrders[lineItem.purchaseOrderId].newId

  lineItem.itemNumber = demoData.gowns[originalGownId].cleanData.itemNumber

  // only obfuscate contact data if it was already set
  if (lineItem.contactId) lineItem.contactId = BL_DEMO_ACCT_CONTACT_ID

  // set new related item data using the gown that was created in the demo account
  lineItem.inventoryItemId = demoData.gowns[originalGownId].newId

  // purchase order item changes
  // set new vendor id
  // purchaseOrderId
  // inventoryItemId
  // contact id
  // itemNumber?

  // Always NULL in customer data
  // transactionId?
  // transactionItemId?

  return {
    ...lineItem,
    ...StaticValues,
  }
}

export default obfuscatePurchaseOrderLineItem
