import { DataWithLineItems } from '..'
import { BridalLivePurchaseOrder } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLivePurchaseOrderItems,
} from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

const StaticValues: Pick<
  BridalLivePurchaseOrder,
  'eventDate' | 'eventContactId' | 'eventContactName' | 'purchaseOrderNumber'
> = {
  eventDate: null,
  eventContactId: null,
  eventContactName: null,
  purchaseOrderNumber: null,
}

const obfuscatePurchaseOrder = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  originalPurchaseOrderId: string,
  purchaseOrder: BridalLivePurchaseOrder,
  allLineItems: MappedBridalLivePurchaseOrderItems
): DataWithLineItems => {
  // skip the purchase order if the vendor wasn't imported
  if (!dataWasAddedToDemo(demoData, 'vendors', purchaseOrder.vendorId)) {
    logInfo(
      `...the Vendor for this Purchase Order was NOT created in demo data`
    )
    return null
  }

  // find associated line items
  const filteredLineItems: MappedBridalLivePurchaseOrderItems = {}
  Object.keys(allLineItems).forEach((poLineItemId: string) => {
    const lineItem = allLineItems[poLineItemId]
    if (lineItem.purchaseOrderId.toString() === originalPurchaseOrderId) {
      filteredLineItems[poLineItemId] = lineItem
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

  purchaseOrder.employeeId = demoSettings.employeeId // BL_DEMO_ACCT_EMPLOYEE_ID,
  purchaseOrder.employeeName = demoSettings.employeeName // BL_DEMO_ACCT_EMPLOYEE_NAME,

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
  purchaseOrder.vendorId = dataIdInDemo(
    demoData,
    'vendors',
    purchaseOrder.vendorId
  )

  return {
    parentData: {
      ...purchaseOrder,
      ...StaticValues,
    },
    lineItems: filteredLineItems,
  }
}

export default obfuscatePurchaseOrder
