import fs from 'fs'
import pluralize from 'pluralize'
import BridalLiveAPI, {
  CreateFunction,
} from '../../integrations/BridalLive/api'
import {
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
import { BL_QA_ROOT_URL, CUSTOMER_DATA_FILES } from '../../settings'
import {
  BridalLiveDemoData,
  MappedBridalLivePurchaseOrderItems,
  MappedBridalLiveReceivingVoucherItems,
} from '../../types'
import obfuscateItem from './obfuscate/item'
import obfuscateItemAttribute from './obfuscate/itemAttribute'
import obfuscateItemImage from './obfuscate/itemImage'
import obfuscatePurchaseOrder from './obfuscate/purchaseOrder'
import obfuscatePurchaseOrderLineItem from './obfuscate/purchaseOrderLineItem'
import obfuscateReceivingVoucher from './obfuscate/receivingVoucher'
import obfuscateReceivingVoucherLineItem from './obfuscate/receivingVoucherLineItem'
import obfuscateVendor from './obfuscate/vendor'

export interface DataWithLineItems {
  parentData: any
  // | BridalLiveReceivingVoucher
  // | BridalLivePosTransaction
  lineItems:
    | MappedBridalLivePurchaseOrderItems
    | MappedBridalLiveReceivingVoucherItems
  // | BridalLivePosTransactionLineItem[]
}

type ObfuscateFunction =
  | typeof obfuscateItem
  | typeof obfuscateVendor
  | typeof obfuscateItemImage
  | typeof obfuscateItemAttribute

type ObfuscateWithLineItemFunction =
  | typeof obfuscatePurchaseOrder
  | typeof obfuscateReceivingVoucher

type ObfuscateLineItemFunction = (
  demoData: BridalLiveDemoData,
  lineItem: BridalLivePurchaseOrderItem | BridalLiveReceivingVoucherItem
) => BridalLivePurchaseOrderItem | BridalLiveReceivingVoucherItem

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

  let slicedIds = type === 'items' ? originalIds.slice(0, 10) : originalIds
  for (const id of slicedIds) {
    let data = mappedCustomerData[id]
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
