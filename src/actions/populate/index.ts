import fs from 'fs'
import pluralize from 'pluralize'
import BridalLiveAPI, {
  CreateFunction,
} from '../../integrations/BridalLive/api'
import {
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucherItem,
  BridalLiveToken,
} from '../../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../../logger'
import {
  BL_DEMO_ACCT_GOWN_DEPT_ID,
  BL_QA_ROOT_URL,
  CUSTOMER_DATA_FILES,
} from '../../settings'
import { BridalLiveDemoData } from '../../types'
import obfuscateGown from './obfuscate/gown'
import obfuscateItemAttribute from './obfuscate/itemAttribute'
import obfuscateItemImage from './obfuscate/itemImage'
import obfuscatePurchaseOrder from './obfuscate/purchaseOrder'
import obfuscatePurchaseOrderLineItem from './obfuscate/purchaseOrderLineItem'
import obfuscateVendor from './obfuscate/vendor'

export interface DataWithLineItems {
  parentData: any
  // | BridalLiveReceivingVoucher
  // | BridalLivePosTransaction
  lineItems: BridalLivePurchaseOrderItem[]
  // | BridalLiveReceivingVoucherItem[]
  // | BridalLivePosTransactionLineItem[]
}

type LineItemData =
  | BridalLivePurchaseOrderItem
  | BridalLiveReceivingVoucherItem
  | BridalLivePosTransactionLineItem

type ObfuscateFunction =
  | typeof obfuscateGown
  | typeof obfuscateVendor
  | typeof obfuscateItemImage
  | typeof obfuscateItemAttribute

type ObfuscateWithLineItemFunction = typeof obfuscatePurchaseOrder

type ObfuscateLineItemFunction = typeof obfuscatePurchaseOrderLineItem

const populateDemoAccount = async (demoAccounttoken: BridalLiveToken) => {
  logHeader(`Populating BridalLive Demo account`)
  try {
    importCustomerData(demoAccounttoken, BL_DEMO_ACCT_GOWN_DEPT_ID)
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

const importCustomerData = async (
  demoAccountToken: BridalLiveToken,
  demoGownDeptId: number
) => {
  let demoData: BridalLiveDemoData = {
    gowns: {},
    vendors: {},
    itemImages: {},
    attributes: {},
    purchaseOrders: {},
    purchaseOrderItems: {},
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
    'gowns',
    CUSTOMER_DATA_FILES.gowns,
    obfuscateGown,
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
  importDataWithLineItems(
    demoAccountToken,
    demoData,
    'purchaseOrders',
    CUSTOMER_DATA_FILES.purchaseOrders,
    CUSTOMER_DATA_FILES.purchaseOrderItems,
    obfuscatePurchaseOrder,
    obfuscatePurchaseOrderLineItem,
    BridalLiveAPI.createPurchaseOrder,
    BridalLiveAPI.createPurchaseOrderItem
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

  let slicedIds = type === 'gowns' ? originalIds.slice(0, 10) : originalIds
  for (const id of slicedIds) {
    let data = mappedCustomerData[id]
    logInfo(
      `Preparing to import ${pluralize.singular(type)} : ${
        data.hasOwnProperty('name') && data.name ? data.name : data.id
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
            `...created ${pluralize.singular(type)}: \n\tID = ${
              createdData.id
            }, \n\tNAME = ${
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

  for (const id of originalIds) {
    let data = mappedCustomerData[id]
    logInfo(
      `Preparing to import ${pluralize.singular(type)} : ${
        data.hasOwnProperty('name') && data.name ? data.name : data.id
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
            `...created ${pluralize.singular(type)}: \n\tDemo Data ID = ${
              createdParentData.id
            }\n\tOriginal ID = ${id}`
          )
          const data = {
            newId: createdParentData.id,
            cleanData: createdParentData,
          }
          demoData[type][id] = data
          console.log(`added to: [${type}][${id}]`)
          console.log(data)

          // obfuscate and create each of the associated line items
          for await (let lineItem of dataWithLineItems.lineItems) {
            logInfo(
              `Preparing to import ${pluralize.singular(type)} line item: ${
                lineItem.hasOwnProperty('itemVendorItemName') &&
                lineItem.itemVendorItemName
                  ? lineItem.itemVendorItemName
                  : lineItem.id
              }`
            )
            const cleanedLineItem = obfuscateLineItemFn(demoData, lineItem)
            console.log('back from obfuscate function')
            if (cleanedLineItem) {
              console.log('have a valid cleaned item')
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
