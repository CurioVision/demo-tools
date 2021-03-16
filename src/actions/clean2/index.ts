import fs from 'fs'
import BridalLiveAPI, {
  FetchAllFunction,
} from '../../integrations/BridalLive/api'
import {
  BaseBridalLiveObject,
  BridalLiveItem,
  BridalLiveItemImage,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePurchaseOrder,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucher,
  BridalLiveReceivingVoucherItem,
  BridalLiveToken,
  LookbookAttribute,
} from '../../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../../logger'
import { BL_QA_ROOT_URL, DemoAccountSettings } from '../../settings'
import {
  MappedBridalLiveAttributes,
  MappedBridalLiveItemImages,
  MappedBridalLiveItems,
  MappedBridalLivePayments,
  MappedBridalLivePosTransactionItems,
  MappedBridalLivePosTransactions,
  MappedBridalLivePurchaseOrderItems,
  MappedBridalLivePurchaseOrders,
  MappedBridalLiveReceivingVoucherItems,
  MappedBridalLiveReceivingVouchers,
  MappedBridalLiveVendors,
} from '../../types'

const cleanBridalLiveDemoAccount = async (
  demoAccounttoken: BridalLiveToken,
  demoSettings: DemoAccountSettings,
  vendorToClean: number | 'all'
) => {
  logHeader(`Rolling back BridalLive Demo account for vendor: ${vendorToClean}`)
  try {
    // fetch all purchase orders
    const purchaseOrders = await fetchAllAndMapData(
      'purchaseOrder',
      demoAccounttoken,
      BridalLiveAPI.fetchAllPurchaseOrders,
      {
        orderType: '',
        status: '',
      }
    )
    // fetch all purchase orders items
    const purchaseOrderItems = await fetchAllAndMapData(
      'purchaseOrderItem',
      demoAccounttoken,
      BridalLiveAPI.fetchAllPurchaseOrderItems,
      {}
    )
    // fetch all receiving orders
    const receivingVouchers = await fetchAllAndMapData(
      'receivingVoucher',
      demoAccounttoken,
      BridalLiveAPI.fetchAllReceivingVouchers,
      {
        status: '',
      }
    )
    // fetch all receiving order items
    const receivingVoucherItems = await fetchAllAndMapData(
      'receivingVoucherItem',
      demoAccounttoken,
      BridalLiveAPI.fetchAllReceivingVoucherItems,
      {}
    )
    // fetch all payments
    const payments = await fetchAllAndMapData(
      'payment',
      demoAccounttoken,
      BridalLiveAPI.fetchAllPayments,
      {}
    )
    // fetch all pos transactions
    const posTransactions = await fetchAllAndMapData(
      'posTransaction',
      demoAccounttoken,
      BridalLiveAPI.fetchAllPosTransactions,
      {}
    )
    // fetch all pos transaction items
    const posTransactionItems = await fetchAllAndMapData(
      'posTransactionItem',
      demoAccounttoken,
      BridalLiveAPI.fetchAllPosTransactionItems,
      {}
    )
    // fetch all items
    const items = await fetchAllAndMapData(
      'item',
      demoAccounttoken,
      BridalLiveAPI.fetchAllItems,
      {
        status: '',
        departmentId: '',
      }
    )
    // fetch all itemImages
    const itemImages = await fetchAllAndMapData(
      'itemImage',
      demoAccounttoken,
      BridalLiveAPI.fetchAllItemImages,
      {}
    )
    // fetch attributes
    const attributes = await fetchAllAndMapData(
      'attribute',
      demoAccounttoken,
      BridalLiveAPI.fetchAllAttributesByItem,
      {
        itemId: '',
      }
    )
    // fetch all vendors
    const vendors = await fetchAllAndMapData(
      'vendor',
      demoAccounttoken,
      BridalLiveAPI.fetchAllVendors,
      {
        status: '',
        isVendorVisibleOnLookbook: '',
      }
    )

    // filter all of the data by vendorToClean
    // NOTE: If 'all' was passed in, the filter functions just return the
    //       original mapped data without filtering
    logHeader(`Filtering fetched data using vendor ID: ${vendorToClean}`)
    const filteredVendors = await filterVendors(vendorToClean, vendors)
    if (Object.keys(filteredVendors).length === 1) {
      logSuccess(
        `...vendor used for filtering: ${
          Object.values(filteredVendors)[0].name
        }`
      )
    } else {
      logSuccess(`...vendor used for filtering: ALL`)
    }

    const filteredItems = await filterItems(vendorToClean, items)
    const filteredItemImages = await filterData(
      vendorToClean,
      filteredItems,
      itemImages,
      'itemImages',
      _shouldCleanItemImage
    )
    const filteredAttributes = await filterData(
      vendorToClean,
      filteredItems,
      attributes,
      'attributes',
      _shouldCleanAttribute
    )
    const [
      filteredPurchaseOrders,
      filteredPurchaseOrderLineItems,
    ] = await filterDataWithLineItems(
      vendorToClean,
      filteredItems,
      purchaseOrders,
      purchaseOrderItems,
      'purchaseOrderId',
      'purchaseOrder'
    )
    const [
      filteredReceivingVouchers,
      filteredReceivingVoucherLineItems,
    ] = await filterDataWithLineItems(
      vendorToClean,
      filteredItems,
      receivingVouchers,
      receivingVoucherItems,
      'receivingVoucherId',
      'receivingVoucher'
    )

    const [
      filteredPosTransactions,
      filteredPosTransactionLineItems,
    ] = await filterDataWithLineItems(
      vendorToClean,
      filteredItems,
      posTransactions,
      posTransactionItems,
      'transactionId',
      'posTransaction'
    )

    const filteredPayments = await filterPayments(
      payments,
      filteredPosTransactions as MappedBridalLivePosTransactions
    )

    _writeDataFile('./data/temp/vendors.json', filteredVendors)
    _writeDataFile('./data/temp/items.json', filteredItems)
    _writeDataFile('./data/temp/itemImages.json', filteredItemImages)
    _writeDataFile('./data/temp/attributes.json', filteredAttributes)
    _writeDataFile('./data/temp/purchaseOrders.json', filteredPurchaseOrders)
    _writeDataFile(
      './data/temp/purchaseOrderLineItems.json',
      filteredPurchaseOrderLineItems
    )
    _writeDataFile(
      './data/temp/receivingVouchers.json',
      filteredReceivingVouchers
    )
    _writeDataFile(
      './data/temp/receivingVoucherLineItems.json',
      filteredReceivingVoucherLineItems
    )
    _writeDataFile('./data/temp/posTransactions.json', filteredPosTransactions)
    _writeDataFile(
      './data/temp/posTransactionLineItems.json',
      filteredPosTransactionLineItems
    )
    _writeDataFile('./data/temp/payments.json', filteredPayments)
  } catch (error) {
    logError('Error occurred while cleaning BridalLive demo account', error)
  }
}

const _shouldCleanItemImage = (
  vendorToClean: number | 'all',
  mappedItems: MappedBridalLiveItems,
  itemImage: BridalLiveItemImage
) => {
  return Object.keys(mappedItems).includes(itemImage.inventoryItemId.toString())
}

const _shouldCleanAttribute = (
  vendorToClean: number | 'all',
  mappedItems: MappedBridalLiveItems,
  attribute: LookbookAttribute
) => {
  return Object.keys(mappedItems).includes(attribute.itemId.toString())
}

const filterVendors = async (
  vendorToClean: number | 'all',
  mappedVendors: MappedBridalLiveVendors
) => {
  logInfo(`...vendor count before filter: ${Object.keys(mappedVendors).length}`)
  if (vendorToClean === 'all') {
    logInfo(`...vendor to clean is 'all'. No vendors filtered.`)
    return mappedVendors
  }

  let filtered: MappedBridalLiveVendors = {}
  for await (const id of Object.keys(mappedVendors)) {
    if (id.toString() === vendorToClean.toString())
      filtered[id] = mappedVendors[id]
  }
  logInfo(`...vendor count after filter: ${Object.keys(filtered).length}`)
  return filtered
}

const filterItems = async (
  vendorToClean: number | 'all',
  mappedItems: MappedBridalLiveItems
) => {
  logInfo(`...item count before filter: ${Object.keys(mappedItems).length}`)
  if (vendorToClean === 'all') {
    logInfo(`...vendor to clean is 'all'. No items filtered.`)
    return mappedItems
  }

  let filtered: MappedBridalLiveItems = {}
  for await (const id of Object.keys(mappedItems)) {
    const item: BridalLiveItem = mappedItems[id]
    if (item.vendorId.toString() === vendorToClean.toString())
      filtered[id] = item
  }
  logInfo(`...item count after filter: ${Object.keys(filtered).length}`)
  return filtered
}

const filterPayments = async (
  mappedPayments: MappedBridalLivePayments,
  posTransactionsBeingCleaned: MappedBridalLivePosTransactions
) => {
  logInfo(
    `...payment count before filter: ${Object.keys(mappedPayments).length}`
  )
  let filtered: MappedBridalLivePayments = {}
  for await (const id of Object.keys(mappedPayments)) {
    const payment: BridalLivePayment = mappedPayments[id]
    if (
      Object.keys(posTransactionsBeingCleaned).includes(
        payment.transactionId.toString()
      )
    )
      filtered[id] = payment
  }
  logInfo(`...payment count after filter: ${Object.keys(filtered).length}`)
  return filtered
}

const filterDataWithLineItems = async (
  vendorToClean: number | 'all',
  mappedItems: MappedBridalLiveItems,
  mappedParents:
    | MappedBridalLivePosTransactions
    | MappedBridalLiveReceivingVouchers
    | MappedBridalLivePosTransactions,
  mappedLineItems:
    | MappedBridalLivePurchaseOrderItems
    | MappedBridalLiveReceivingVoucherItems
    | MappedBridalLivePosTransactionItems,
  parentIdKey: 'purchaseOrderId' | 'receivingVoucherId' | 'transactionId',
  type: 'purchaseOrder' | 'receivingVoucher' | 'posTransaction'
) => {
  logInfo(
    `...${type}s count before filter: ${Object.keys(mappedParents).length}`
  )
  logInfo(
    `...${type}LineItems count before filter: ${
      Object.keys(mappedLineItems).length
    }`
  )
  if (vendorToClean === 'all') {
    logInfo(`...vendor to clean is 'all'. Nothing filtered.`)
    return [mappedParents, mappedLineItems]
  }

  let filteredLineItems:
    | MappedBridalLivePurchaseOrderItems
    | MappedBridalLiveReceivingVoucherItems
    | MappedBridalLivePosTransactionItems = {}
  let parentIdsToClean: number[] = []
  for await (const id of Object.keys(mappedLineItems)) {
    const lineItem:
      | BridalLivePurchaseOrderItem
      | BridalLiveReceivingVoucherItem = mappedLineItems[id]
    if (
      Object.keys(mappedItems).includes(lineItem.inventoryItemId.toString())
    ) {
      // add line item to filtered and add the parent id to clean
      filteredLineItems[id] = lineItem
      parentIdsToClean.push(lineItem[parentIdKey])
    }
  }

  let filtered:
    | MappedBridalLivePurchaseOrders
    | MappedBridalLiveReceivingVouchers
    | MappedBridalLivePosTransactions = {}
  for await (const id of Object.keys(mappedParents)) {
    const parent:
      | BridalLivePurchaseOrder
      | BridalLiveReceivingVoucher
      | BridalLivePosTransaction = mappedParents[id]
    // if the purchase order's vendor is being cleaned OR if any of the line items
    // are being cleaned
    if (
      (parent.hasOwnProperty('vendorId') &&
        parent['vendorId'].toString() === vendorToClean.toString()) ||
      parentIdsToClean.includes(parent.id)
    ) {
      filtered[id] = parent
    }
  }

  logInfo(`...${type}s count after filter: ${Object.keys(filtered).length}`)
  logInfo(
    `...${type}LineItems count after filter: ${
      Object.keys(filteredLineItems).length
    }`
  )

  return [filtered, filteredLineItems]
}

const filterData = async (
  vendorToClean: number | 'all',
  mappedItems: MappedBridalLiveItems,
  mappedData: MappedBridalLiveItemImages | MappedBridalLiveAttributes,
  type: 'itemImages' | 'attributes',
  shouldCleanFn: (
    vendorToClean: number | 'all',
    mappedItems: MappedBridalLiveItems,
    data: any
  ) => boolean
) => {
  logInfo(`...${type} count before filter: ${Object.keys(mappedData).length}`)
  if (vendorToClean === 'all') {
    logInfo(`...vendor to clean is 'all'. No ${type} filtered.`)
    return mappedData
  }

  let filtered: MappedBridalLiveItemImages | MappedBridalLiveAttributes = {}
  for await (const id of Object.keys(mappedData)) {
    const data = mappedData[id]
    if (shouldCleanFn(vendorToClean, mappedItems, data)) filtered[id] = data
  }

  logInfo(`...${type} count after filter: ${Object.keys(filtered).length}`)
  return filtered
}

const fetchAllAndMapData = async (
  itemType: string,
  demoAccountToken: BridalLiveToken,
  fetchAllFn: FetchAllFunction,
  fetchAllFilter: any
) => {
  logInfo(`Fetching all demo account ${itemType}s`)
  const allData: BaseBridalLiveObject[] = await fetchAllFn(
    BL_QA_ROOT_URL,
    demoAccountToken,
    fetchAllFilter
  )
  let mapped = {}
  if (allData && allData.length > 0) {
    logInfo(`...found ${allData.length} ${itemType}s`)
    allData.reduce((_mapped, data) => {
      _mapped[data.id] = data
      return _mapped
    }, mapped)
  } else {
    logInfo(`...no ${itemType}s found`)
  }
  return mapped
}

const _writeDataFile = async (filename: string, data: object) => {
  const json = JSON.stringify(data, null, 2)
  logInfo(`Writing customer data to: ${filename}`)
  try {
    fs.writeFileSync(filename, json)
    logSuccess(`...${filename} created`)
  } catch (error) {
    logError('Failed to write customer data file.', error)
  }
}

export default cleanBridalLiveDemoAccount
