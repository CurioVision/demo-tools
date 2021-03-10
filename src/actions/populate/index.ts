import fs from 'fs'
import pluralize from 'pluralize'
import BridalLiveAPI, {
  CreateFunction,
} from '../../integrations/BridalLive/api'
import {
  BridalLivePayment,
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucherItem,
  BridalLiveToken,
} from '../../integrations/BridalLive/apiTypes'
import {
  logDebug,
  logError,
  logHeader,
  logInfo,
  logSuccess,
} from '../../logger'
import {
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_QA_ROOT_URL,
  CUSTOMER_DATA_FILES,
} from '../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLivePosTransactionItems,
  MappedBridalLivePurchaseOrderItems,
  MappedBridalLiveReceivingVoucherItems,
} from '../../types'
import obfuscateItem from './obfuscate/item'
import obfuscateItemAttribute from './obfuscate/itemAttribute'
import obfuscateItemImage from './obfuscate/itemImage'
import obfuscatePayment, {
  BridalLivePaymentObfuscationData,
} from './obfuscate/payment'
import obfuscatePosTransaction from './obfuscate/posTransaction'
import obfuscatePosTransactionLineItem from './obfuscate/posTransactionItem'
import obfuscatePurchaseOrder from './obfuscate/purchaseOrder'
import obfuscatePurchaseOrderLineItem from './obfuscate/purchaseOrderLineItem'
import obfuscateReceivingVoucher from './obfuscate/receivingVoucher'
import obfuscateReceivingVoucherLineItem from './obfuscate/receivingVoucherLineItem'
import { shouldImportCustomerVendor } from './obfuscate/utils'
import obfuscateVendor from './obfuscate/vendor'

const LIMIT_ITEM_CNT = 10
export interface DataWithLineItems {
  parentData: any
  // | BridalLiveReceivingVoucher
  // | BridalLivePosTransaction
  lineItems:
    | MappedBridalLivePurchaseOrderItems
    | MappedBridalLiveReceivingVoucherItems
    | MappedBridalLivePosTransactionItems
}

type ObfuscateFunction =
  | typeof obfuscateItem
  | typeof obfuscateVendor
  | typeof obfuscateItemImage
  | typeof obfuscateItemAttribute
  | typeof obfuscatePayment

type ObfuscateWithLineItemFunction =
  | typeof obfuscatePurchaseOrder
  | typeof obfuscateReceivingVoucher
  | typeof obfuscatePosTransaction

type ObfuscateLineItemFunction = (
  demoData: BridalLiveDemoData,
  lineItem:
    | BridalLivePurchaseOrderItem
    | BridalLiveReceivingVoucherItem
    | BridalLivePosTransactionLineItem
) =>
  | BridalLivePurchaseOrderItem
  | BridalLiveReceivingVoucherItem
  | BridalLivePosTransactionLineItem

const populateDemoAccount = async (demoAccounttoken: BridalLiveToken) => {
  logHeader(`Populating BridalLive Demo account`)
  try {
    importCustomerData(demoAccounttoken)
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

const importCustomerData = async (demoAccountToken: BridalLiveToken) => {
  let demoData: BridalLiveDemoData = {
    items: {},
    vendors: {},
    itemImages: {},
    attributes: {},
    purchaseOrders: {},
    purchaseOrderItems: {},
    receivingVouchers: {},
    receivingVoucherItems: {},
    posTransactions: {},
    posTransactionItems: {},
    payments: {},
  }
  // import vendors
  demoData = await importData(
    demoAccountToken,
    demoData,
    'vendors',
    CUSTOMER_DATA_FILES.vendors,
    obfuscateVendor,
    BridalLiveAPI.createVendor
  )
  // import gowns
  demoData = await importData(
    demoAccountToken,
    demoData,
    'items',
    CUSTOMER_DATA_FILES.items,
    obfuscateItem,
    BridalLiveAPI.createItem
  )
  // import item images
  demoData = await importData(
    demoAccountToken,
    demoData,
    'itemImages',
    CUSTOMER_DATA_FILES.itemImages,
    obfuscateItemImage,
    BridalLiveAPI.createItemImage
  )
  // import item attributes
  demoData = await importData(
    demoAccountToken,
    demoData,
    'attributes',
    CUSTOMER_DATA_FILES.attributes,
    obfuscateItemAttribute,
    BridalLiveAPI.createAttribute
  )
  // import purchase orders and purchase order line items
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'purchaseOrders',
    'purchaseOrderItems',
    CUSTOMER_DATA_FILES.purchaseOrders,
    CUSTOMER_DATA_FILES.purchaseOrderItems,
    obfuscatePurchaseOrder,
    obfuscatePurchaseOrderLineItem,
    BridalLiveAPI.createPurchaseOrder,
    BridalLiveAPI.createPurchaseOrderItem
  )
  // import receiving vouchers and receiving voucher line items
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'receivingVouchers',
    'receivingVoucherItems',
    CUSTOMER_DATA_FILES.receivingVouchers,
    CUSTOMER_DATA_FILES.receivingVoucherItems,
    obfuscateReceivingVoucher,
    obfuscateReceivingVoucherLineItem,
    BridalLiveAPI.createReceivingVoucher,
    BridalLiveAPI.createReceivingVoucherItem
  )
  // import pos transactions and pos transaction line items
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'posTransactions',
    'posTransactionItems',
    CUSTOMER_DATA_FILES.posTransactions,
    CUSTOMER_DATA_FILES.posTransactionItems,
    obfuscatePosTransaction,
    obfuscatePosTransactionLineItem,
    BridalLiveAPI.createPosTransaction,
    BridalLiveAPI.createPosTransactionItem
  )
  // import payments
  demoData = await importPayments(demoAccountToken, demoData)
}

/**
 * Obfuscates and imports basic BridalLive data types like vendors, items,
 * attributes etc.
 *
 * @param demoAccountToken
 * @param demoData
 * @param type
 * @param dataFilename
 * @param obfuscateFn
 * @param createFn
 */
const importData = async (
  demoAccountToken: BridalLiveToken,
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  dataFilename: string,
  obfuscateFn: ObfuscateFunction,
  createFn: CreateFunction
) => {
  const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  const originalIds = Object.keys(mappedCustomerData)
  logInfo(`Importing ${originalIds.length} ${type}`)

  for await (const id of originalIds) {
    let data = mappedCustomerData[id]

    // only import specified vendors. since
    if (type === 'vendors' && !shouldImportCustomerVendor(id)) {
      logInfo(
        `Skipping Vendor import because it is not included in import settings. 
        \tVendor Name: ${data.name}
        \tVendor ID: ${id}`
      )
      continue
    } else {
      logInfo(
        `Preparing to import ${pluralize.singular(type)} : ${
          data.hasOwnProperty('name') && data.name ? data.name : id
        }`
      )

      data = obfuscateFn(demoData, data)
      if (data) {
        try {
          const createdData = await createFn(
            BL_QA_ROOT_URL,
            demoAccountToken,
            data
          )
          if (createdData) {
            logSuccess(
              `...created ${pluralize.singular(type)}: \n\tDEMO DATA ID = ${
                createdData.id
              }, \n\tORIGINAL ID = ${id}, \n\tNAME = ${
                createdData.hasOwnProperty('name')
                  ? createdData['name']
                  : 'Data type has no name'
              }`
            )
            const data = {
              newId: createdData.id,
              cleanData: createdData,
            }
            demoData[type][id] = data
          }
        } catch (error) {
          logError('Error while creating demo date', error)
        }
      } else {
        logInfo(`...skipped import of ${pluralize.singular(type)}`)
      }
    }
  }
  return demoData
}

/**
 * Obfuscates and imports BridalLive data types that include line items like
 * purchaseOrders, receivingVouchers, posTransactions
 *
 * @param demoAccountToken
 * @param demoData
 * @param type
 * @param dataFilename
 * @param obfuscateFn
 * @param createFn
 */
const importDataWithLineItems = async (
  demoAccountToken: BridalLiveToken,
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  lineItemType: keyof BridalLiveDemoData,
  dataFilename: string,
  lineItemDataFilename: string,
  obfuscateFn: ObfuscateWithLineItemFunction,
  obfuscateLineItemFn: ObfuscateLineItemFunction,
  createFn: CreateFunction,
  createLineItemFn: CreateFunction
) => {
  const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  const mappedCustomerLineItemData = await _readCustomerDataFile(
    lineItemDataFilename
  )

  const originalIds = Object.keys(mappedCustomerData)
  logInfo(`Importing ${originalIds.length} ${type}`)

  for await (const id of originalIds) {
    let data = mappedCustomerData[id]
    logInfo(
      `Preparing to import ${pluralize.singular(type)} : ${
        data.hasOwnProperty('name') && data.name ? data.name : id
      }`
    )

    const dataWithLineItems: DataWithLineItems = obfuscateFn(
      demoData,
      id,
      data,
      mappedCustomerLineItemData
    )
    if (dataWithLineItems) {
      try {
        const createdParentData = await createFn(
          BL_QA_ROOT_URL,
          demoAccountToken,
          dataWithLineItems.parentData
        )
        if (createdParentData) {
          logSuccess(
            `...created ${pluralize.singular(type)}: \n\tDEMO DATA ID = ${
              createdParentData.id
            }\n\tORIGINAL ID = ${id}`
          )
          const data = {
            newId: createdParentData.id,
            cleanData: createdParentData,
          }
          demoData[type][id] = data
          logDebug(`added to: [${type}][${id}]`)
          logDebug(data)

          // obfuscate and create each of the associated line items
          for await (let originalLineItemId of Object.keys(
            dataWithLineItems.lineItems
          )) {
            const lineItem = dataWithLineItems.lineItems[originalLineItemId]
            logInfo(
              `Preparing to import ${pluralize.singular(type)} line item: ${
                lineItem.hasOwnProperty('itemVendorItemName') &&
                lineItem.itemVendorItemName
                  ? lineItem.itemVendorItemName
                  : lineItem.id
              }`
            )
            const cleanedLineItem = obfuscateLineItemFn(demoData, lineItem)
            logDebug('back from obfuscate function')
            if (cleanedLineItem) {
              logDebug('have a valid cleaned item')
              try {
                const createdLineItem = await createLineItemFn(
                  BL_QA_ROOT_URL,
                  demoAccountToken,
                  cleanedLineItem
                )

                if (createdLineItem) {
                  logSuccess(
                    `...created ${pluralize.singular(
                      type
                    )} line item: \n\tID = ${createdParentData.id}`
                  )
                  const lineItemData = {
                    newId: createdLineItem.id,
                    cleanData: createdLineItem,
                  }
                  demoData[lineItemType][originalLineItemId] = lineItemData
                }
              } catch (error) {
                logError('Error while creating demo line item data', error)
              }
            } else {
              logInfo(
                `...skipped import of ${pluralize.singular(type)} line item`
              )
            }
          }
        }
      } catch (error) {
        logError(
          `Error while creating demo data: ${pluralize.singular(type)}`,
          error
        )
      }
    } else {
      logInfo(`...skipped import of ${pluralize.singular(type)}`)
    }
  }
  return demoData
}

/**
 * Obfuscates payments and adds them to the correct POS Transaction in the
 * demo account. After payment has been succesfully added, the POS Transaction
 * is completed.
 *
 * @param demoAccountToken
 * @param demoData
 * @param type
 * @param dataFilename
 * @param obfuscateFn
 * @param createFn
 */
const importPayments = async (
  demoAccountToken: BridalLiveToken,
  demoData: BridalLiveDemoData
) => {
  const mappedCustomerPayments = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.payments
  )

  const mappedCustomerTransactions = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.posTransactions
  )

  const originalIds = Object.keys(mappedCustomerPayments)
  logInfo(`Importing ${originalIds.length} payments`)

  for await (const id of originalIds) {
    let paymentData: BridalLivePayment = mappedCustomerPayments[id]
    logInfo(`Preparing to import payment: ${id}`)

    let obfuscatedPayment: BridalLivePaymentObfuscationData = obfuscatePayment(
      demoData,
      paymentData
    )
    if (obfuscatedPayment) {
      try {
        const updatedPosTransaction = await BridalLiveAPI.addPaymentToPosTransaction(
          BL_QA_ROOT_URL,
          demoAccountToken,
          obfuscatedPayment.cleanData
        )
        if (updatedPosTransaction) {
          logSuccess(
            `...added payment to POS transaction: \n\tDEMO DATA ID = ${updatedPosTransaction.id}, \n\tORIGINAL ID = ${id}`
          )
          const data = {
            newId: updatedPosTransaction.id,
            cleanData: updatedPosTransaction,
          }
          demoData['payments'][id] = data

          // if the POS associated with this transaction was completed, complete
          const origTrxId = obfuscatedPayment.originalPosTransactionId.toString()
          logInfo(
            `...checking original transaction status before completing transaction. \n\tDEMO DATA TRX ID = ${updatedPosTransaction.id}, \n\tORIGINAL TRX ID = ${origTrxId}`
          )

          if (Object.keys(mappedCustomerTransactions).includes(origTrxId)) {
            logInfo(
              `...original transaction status is: ${
                mappedCustomerTransactions[origTrxId.toString()].status
              }`
            )
            if (
              mappedCustomerTransactions[origTrxId].status.toUpperCase() === 'C'
            ) {
              logInfo(
                `...payment's original transaction was completed. Attempting to complete transaction. \n\tDEMO DATA TRX ID = ${updatedPosTransaction.transactionId}, \n\tORIGINAL TRX ID = ${origTrxId}`
              )
              const completedTrx = await BridalLiveAPI.completePosTransaction(
                BL_QA_ROOT_URL,
                demoAccountToken,
                updatedPosTransaction.id,
                BL_DEMO_ACCT_EMPLOYEE_ID
              )
              if (completedTrx) {
                logSuccess(
                  `...completed transaction: \n\tDEMO DATA ID = ${updatedPosTransaction.id}`
                )
              }
            }
          }
        }
      } catch (error) {
        logError('Error while creating demo date', error)
      }
    } else {
      logInfo(`...skipped import of payment`)
    }
  }
  return demoData
}

const _readCustomerDataFile = async (filename: string) => {
  try {
    logInfo(`Reading customer data: ${filename}`)
    let rawData = fs.readFileSync(filename)
    return JSON.parse(rawData.toString())
  } catch (error) {
    logError('Failed to read customer data file.', error)
  }
}

export default populateDemoAccount
