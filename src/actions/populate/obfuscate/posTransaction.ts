import { DataWithLineItems } from '..'
import {
  BridalLivePosTransaction,
  BridalLivePosTransactionLineItem,
} from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLivePosTransactionItems,
} from '../../../types'
import {
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

const StaticValues: Pick<
  BridalLivePosTransaction,
  | 'contactPhone'
  | 'eventId'
  | 'qbEditSequence'
  | 'qbTxnId'
  | 'qboExportDateTime'
  | 'shipToName'
  | 'shipToAddress1'
  | 'shipToAddress2'
  | 'shipToCity'
  | 'shipToState'
  | 'shipToZip'
  | 'linkedTransactionId'
> = {
  contactPhone: null,
  eventId: null,
  qbEditSequence: null,
  qbTxnId: null,
  qboExportDateTime: null,
  shipToName: null,
  shipToAddress1: null,
  shipToAddress2: null,
  shipToCity: null,
  shipToState: null,
  shipToZip: null,
  linkedTransactionId: null,
}

const obfuscatePosTransaction = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  originalPosTransactionId: string,
  posTransaction: BridalLivePosTransaction,
  allLineItems: MappedBridalLivePosTransactionItems
): DataWithLineItems => {
  // find associated line items
  const filteredLineItems: MappedBridalLivePosTransactionItems = {}
  Object.keys(allLineItems).forEach((trxLineItemId: string) => {
    const lineItem: BridalLivePosTransactionLineItem =
      allLineItems[trxLineItemId]
    if (lineItem.transactionId.toString() === originalPosTransactionId) {
      filteredLineItems[trxLineItemId] = lineItem
    }
  })

  // if none of the lineItems are for items that were imported into the demo
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
  posTransaction = obfuscateBaseBridalLiveData(posTransaction)

  posTransaction.employeeId = demoSettings.employeeId // BL_DEMO_ACCT_EMPLOYEE_ID,
  posTransaction.employeeName = demoSettings.employeeName // BL_DEMO_ACCT_EMPLOYEE_NAME,
  posTransaction.contactId = demoSettings.contactId // BL_DEMO_ACCT_CONTACT_ID,
  posTransaction.contactName = demoSettings.contactName // BL_DEMO_ACCT_CONTACT_NAME,

  // obfuscate dates
  posTransaction.orderDate = obfuscateDateAsBridalLiveString(
    posTransaction.orderDate
  )
  posTransaction.completedDate = obfuscateDateAsBridalLiveString(
    posTransaction.completedDate
  )
  posTransaction.eventDate = obfuscateDateAsBridalLiveString(
    posTransaction.eventDate
  )

  // Should these be obfuscated / replaced?
  // trxNumber
  // originalTrxNumber

  return {
    parentData: {
      ...posTransaction,
      ...StaticValues,
    },
    lineItems: filteredLineItems,
  }
}

export default obfuscatePosTransaction
