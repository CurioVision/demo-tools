import { DataWithLineItems } from '..'
import { BridalLivePurchaseOrder } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_DEMO_ACCT_EMPLOYEE_NAME,
} from '../../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLivePurchaseOrderItems,
} from '../../../types'
import {
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

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

const obfuscatePurchaseOrder = (
  demoData: BridalLiveDemoData,
  originalId: string,
  purchaseOrder: BridalLivePurchaseOrder,
  allLineItems: MappedBridalLivePurchaseOrderItems
): DataWithLineItems => {
  // find associated line items
  const filteredLineItems: MappedBridalLivePurchaseOrderItems = {}
  Object.keys(allLineItems).forEach((poLineItemId: string) => {
    const po = allLineItems[poLineItemId]
    if (po.purchaseOrderId.toString() === originalId) {
      filteredLineItems[poLineItemId] = po
    }
  })

  // if none of the lineItems are for gowns that were imported into the demo
  // account, return null so this PO doesn't get imported
  const shouldImport = Object.values(
    filteredLineItems
  ).findIndex((poLineItem) =>
    dataWasAddedToDemo(demoData, 'items', poLineItem.inventoryItemId)
  )
  if (shouldImport < 0) {
    logInfo(
      `...none of the Line Items map to corresponding Items that were created in demo data`
    )
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating purchase order data`)
  purchaseOrder = obfuscateBaseBridalLiveData(purchaseOrder)

  // obfuscate dates
  purchaseOrder.orderDate = obfuscateDateAsBridalLiveString(
    purchaseOrder.orderDate
  )
  purchaseOrder.shipDate = obfuscateDateAsBridalLiveString(
    purchaseOrder.shipDate
  )
  purchaseOrder.submittedDate = obfuscateDateAsBridalLiveString(
    purchaseOrder.submittedDate
  )
  purchaseOrder.cancelDate = obfuscateDateAsBridalLiveString(
    purchaseOrder.cancelDate
  )

  // set new vendor id
  purchaseOrder.vendorId = demoData.vendors[purchaseOrder.vendorId].newId

  return {
    parentData: {
      ...purchaseOrder,
      ...StaticValues,
    },
    lineItems: filteredLineItems,
  }
}

export default obfuscatePurchaseOrder
