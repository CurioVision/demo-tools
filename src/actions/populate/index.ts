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
  logSevereError,
  logSuccess,
} from '../../logger'
import {
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_QA_ROOT_URL,
  CUSTOMER_DATA_FILES,
  VALID_CUSTOMERS,
} from '../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLiveAttributes,
  MappedBridalLiveItemImages,
  MappedBridalLiveItems,
  MappedBridalLivePayments,
  MappedBridalLivePosTransactionItems,
  MappedBridalLivePosTransactions,
  MappedBridalLivePurchaseOrderItems,
  MappedBridalLiveReceivingVoucherItems,
  MappedBridalLiveVendors,
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

const populateDemoAccount = async (
  demoAccounttoken: BridalLiveToken,
  customer: VALID_CUSTOMERS | 'all',
  vendor: number | 'all'
) => {
  logHeader(`Populating BridalLive Demo account using:
  \tCUSTOMER: ${customer}
  \tVENDOR: ${vendor}`)

  try {
    importCustomerData(demoAccounttoken, customer, vendor)
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

const importCustomerData = async (
  demoAccountToken: BridalLiveToken,
  customer: VALID_CUSTOMERS | 'all',
  vendorToImport: number | 'all'
) => {
  if (customer === 'all') {
    logSevereError('Importing all customers not implemented yet', {})
    return
  }

  const importCustomer = customer as VALID_CUSTOMERS
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
  const mappedCustomerVendors = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.vendors(importCustomer)
  )
  // filter vendors by the specified vendor ID. Since Items check for an imported
  // vendor and all other types check for an imported Item before importing,
  // controlling the vendor is enough to limit what gets imported
  const vendorIds = Object.keys(mappedCustomerVendors)
  logInfo(`${customer} has ${vendorIds.length} total vendors`)

  logInfo(`Filtering vendors to import`)

  let filteredVendorMap: MappedBridalLiveVendors = {}
  for await (const id of vendorIds) {
    const vendor = mappedCustomerVendors[id]

    // only import specified vendors. since
    if (!shouldImportCustomerVendor(customer, vendorToImport, id)) {
      logInfo(
        `Skipping Vendor import because it is NOT included in import settings. 
        \tVendor Name: ${vendor.name}
        \tVendor ID: ${id}`
      )
    } else {
      logInfo(
        `Vendor will be imported because it IS included in import settings. 
        \tVendor Name: ${vendor.name}
        \tVendor ID: ${id}`
      )
      filteredVendorMap[id] = vendor
    }
  }
  logInfo(`${
    Object.keys(filteredVendorMap).length
  } total vendors will be imported:
  \t${Object.keys(filteredVendorMap)}`)

  demoData = await importData(
    demoAccountToken,
    demoData,
    'vendors',
    filteredVendorMap,
    obfuscateVendor,
    BridalLiveAPI.createVendor
  )
  // import items
  const mappedCustomerItems = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.items(importCustomer)
  )
  demoData = await importData(
    demoAccountToken,
    demoData,
    'items',
    mappedCustomerItems,
    obfuscateItem,
    BridalLiveAPI.createItem
  )
  // import item images
  const mappedCustomerItemImages = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.itemImages(importCustomer)
  )
  demoData = await importData(
    demoAccountToken,
    demoData,
    'itemImages',
    mappedCustomerItemImages,
    obfuscateItemImage,
    BridalLiveAPI.createItemImage
  )
  // import item attributes
  const mappedCustomerAttributes = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.attributes(importCustomer)
  )
  demoData = await importData(
    demoAccountToken,
    demoData,
    'attributes',
    mappedCustomerAttributes,
    obfuscateItemAttribute,
    BridalLiveAPI.createAttribute
  )
  // import purchase orders and purchase order line items
  const mappedCustomerPurchaseOrderData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.purchaseOrders(customer as VALID_CUSTOMERS)
  )
  const mappedCustomerPurchaseOrderLineItemData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.purchaseOrderItems(customer as VALID_CUSTOMERS)
  )
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'purchaseOrders',
    'purchaseOrderItems',
    mappedCustomerPurchaseOrderData,
    mappedCustomerPurchaseOrderLineItemData,
    obfuscatePurchaseOrder,
    obfuscatePurchaseOrderLineItem,
    BridalLiveAPI.createPurchaseOrder,
    BridalLiveAPI.createPurchaseOrderItem
  )
  // import receiving vouchers and receiving voucher line items
  const mappedCustomerReceivingVoucherData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.receivingVouchers(customer as VALID_CUSTOMERS)
  )
  const mappedCustomerReceivingVoucherLineItemData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.receivingVoucherItems(customer as VALID_CUSTOMERS)
  )
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'receivingVouchers',
    'receivingVoucherItems',
    mappedCustomerReceivingVoucherData,
    mappedCustomerReceivingVoucherLineItemData,
    obfuscateReceivingVoucher,
    obfuscateReceivingVoucherLineItem,
    BridalLiveAPI.createReceivingVoucher,
    BridalLiveAPI.createReceivingVoucherItem
  )
  // import pos transactions and pos transaction line items
  const mappedCustomerPosTransactionData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.posTransactions(customer as VALID_CUSTOMERS)
  )
  const mappedCustomerPosTransactionLineItemData = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.posTransactionItems(customer as VALID_CUSTOMERS)
  )
  demoData = await importDataWithLineItems(
    demoAccountToken,
    demoData,
    'posTransactions',
    'posTransactionItems',
    mappedCustomerPosTransactionData,
    mappedCustomerPosTransactionLineItemData,
    obfuscatePosTransaction,
    obfuscatePosTransactionLineItem,
    BridalLiveAPI.createPosTransaction,
    BridalLiveAPI.createPosTransactionItem
  )
  // import payments
  const mappedCustomerPayments = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.payments(customer as VALID_CUSTOMERS)
  )

  const mappedCustomerTransactions = await _readCustomerDataFile(
    CUSTOMER_DATA_FILES.posTransactions(customer as VALID_CUSTOMERS)
  )

  demoData = await importPayments(
    demoAccountToken,
    demoData,
    mappedCustomerPayments,
    mappedCustomerTransactions
  )
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
  mappedCustomerData:
    | MappedBridalLiveVendors
    | MappedBridalLiveItems
    | MappedBridalLiveAttributes
    | MappedBridalLiveItemImages,
  obfuscateFn: ObfuscateFunction,
  createFn: CreateFunction
) => {
  // const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  const originalIds = Object.keys(mappedCustomerData)
  logInfo(`Importing ${originalIds.length} ${type}`)

  for await (const id of originalIds) {
    let data = mappedCustomerData[id]

    // only import specified vendors. since
    // if (type === 'vendors' && !shouldImportCustomerVendor(id)) {
    //   logInfo(
    //     `Skipping Vendor import because it is not included in import settings.
    //     \tVendor Name: ${data.name}
    //     \tVendor ID: ${id}`
    //   )
    //   continue
    // } else {
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
    // }
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
  mappedCustomerData: any,
  mappedCustomerLineItemData: any,
  // dataFilename: string,
  // lineItemDataFilename: string,
  obfuscateFn: ObfuscateWithLineItemFunction,
  obfuscateLineItemFn: ObfuscateLineItemFunction,
  createFn: CreateFunction,
  createLineItemFn: CreateFunction
) => {
  // const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  // const mappedCustomerLineItemData = await _readCustomerDataFile(
  //   lineItemDataFilename
  // )

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
  demoData: BridalLiveDemoData,
  mappedCustomerPayments: MappedBridalLivePayments,
  mappedCustomerTransactions: MappedBridalLivePosTransactions
) => {
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
