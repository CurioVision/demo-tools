// TODO: Combine this file and `app/integrations/BridalLive/api`, as well as
// BridalLive types, in a single node package that app & functions can import

import fetch from 'node-fetch'
import { logDebug, logError, logInfo, logSevereError } from '../../logger'
import {
  BL_DEMO_ACCTS,
  BL_PROD_ROOT_URL,
  BL_QA_ROOT_URL,
  GLOBAL_IS_CUSTOMER_ACTION_KEY,
} from '../../settings'
import {
  BaseBridalLiveObject,
  BridalLiveCompany,
  BridalLiveContact,
  BridalLiveItem,
  BridalLiveItemImage,
  BridalLiveItemTransaction,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrder,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucher,
  BridalLiveReceivingVoucherItem,
  BridalLiveToken,
  BridalLiveVendor,
  FullBridalLiveItem,
  ItemDetailsForLookbookCriteria,
  ItemImagesCriteria,
  ItemListCriteria,
  LookbookAttribute,
} from './apiTypes'

export type FetchAllFunction = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: {}
) => Promise<BaseBridalLiveObject[]>

export type DeleteFunction = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  id: string | number
) => Promise<any>

export type CreateFunction = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  item: BaseBridalLiveObject
) => Promise<BaseBridalLiveObject>

type BL_ROOT_URL = typeof BL_QA_ROOT_URL | typeof BL_PROD_ROOT_URL

const LOGIN_ENDPOINT = '/bl-server/api/auth/apiLogin'

/**
 * BridalLive `company-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/company-controller
 */
const COMPANY_ENDPOINTS = {
  company: '/bl-server/api/company',
}
// /**
//  * BridalLive `department-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/company-controller
//  */
// const DEPARTMENT_ENDPOINTS = {
//   departments: '/bl-server/api/departments/list'
// }

// /**
//  * BridalLive `department-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/employee-controller
//  */
// const EMPLOYEE_ENDPOINTS = {
//   employees: '/bl-server/api/employees/list'
// }

/**
 * BridalLive `sales-reports-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/sales-reports-controller
 */
const SALES_REPORT_ENDPOINTS = {
  // byItem: '/bl-server/api/reports/salesReports/salesBy/itemName?',
  // byDept: '/bl-server/api/reports/salesReports/salesBy/departmentId?',
  transactionItemJournal:
    '/bl-server/api/reports/salesReports/transactionItemJournal?',
}

/**
 * BridalLive `item-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller
 */
const ITEM_ENDPOINTS = {
  allItems: '/bl-server/api/items/list',
  updateItem: '/bl-server/api/items',
  createItem: '/bl-server/api/items',
  getItem: '/bl-server/api/items',
  deleteItem: '/bl-server/api/items',
  allAttributes: '/bl-server/api/items/getItemDetailsForLookbook',
}

const ITEM_ATTRIBUTE_ENDPOINTS = {
  allItemAttributes: '/bl-server/api/itemItemAttributes/list',
  updateItemAttributes: '/bl-server/api/itemItemAttributes',
  createItemAttributes: '/bl-server/api/itemItemAttributes',
  deleteItemAttributes: '/bl-server/api/itemItemAttributes',
}

/**
 * BridalLive `item-picture-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-picture-controller
 */
const ITEM_PICTURE_ENDPOINTS = {
  allPictures: '/bl-server/api/itemPictures/list',
  deletePicture: '/bl-server/api/itemPictures',
  createPicture: '/bl-server/api/itemPictures',
}

// /**
//  * BridalLive `purchase-reports-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-reports-controller
//  */
// const PURCHASE_REPORTS_ENDPOINTS = {
//   receivingReport: '/bl-server/api/reports/purchasingReports/receivingReport'
// }

/**
 * BridalLive `purchase-order-item-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-item-controller
 */
const PURCHASE_ORDER_ITEMS_ENDPOINTS = {
  allPurchaseOrderItems: '/bl-server/api/purchaseOrderItems/list',
  createPurchaseOrderItem: '/bl-server/api/purchaseOrderItems',
  deletePurchaseOrderItem: '/bl-server/api/purchaseOrderItems',
}

/**
 * BridalLive `purchase-order-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller
 */
const PURCHASE_ORDERS_ENDPOINTS = {
  allPurchaseOrders: '/bl-server/api/purchaseOrders/list?page=0',
  createPurchaseOrderForItem: '/bl-server/api/purchaseOrders/createPOForItems',
  createPurchaseOrder: `/bl-server/api/purchaseOrders`,
  updatePurchaseOrder: `/bl-server/api/purchaseOrders`,
  deletePurchaseOrder: '/bl-server/api/purchaseOrders',
}

// /**
//  * BridalLive `receiving-voucher-item-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/receiving-voucher-item-controller
//  */
// const RECEIVING_VOUCHER_ITEMS_ENDPOINTS = {
//   allReceivingVouchersItems: '/bl-server/api/receivingVoucherItems/list'
// }

/**
 * BridalLive `receiving-voucher-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/receiving-voucher-controller
 */
const RECEIVING_VOUCHERS_ENDPOINTS = {
  allReceivingVouchers: '/bl-server/api/receivingVouchers/list?page=0',
  createReceivingVoucherForPOItems:
    '/bl-server/api/receivingVouchers/createForPOItems',
  updateReceivingVoucher: '/bl-server/api/receivingVouchers',
  createReceivingVoucher: '/bl-server/api/receivingVouchers',
  deleteReceivingVoucher: '/bl-server/api/receivingVouchers',
}

/**
 * BridalLive `receiving-voucher-item-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/receiving-voucher-item-controller
 */
const RECEIVING_VOUCHER_ITEMS_ENDPOINTS = {
  allReceivingVoucherItems: '/bl-server/api/receivingVoucherItems/list?page=0',
  createReceivingVoucherItem: '/bl-server/api/receivingVoucherItems',
  deleteReceivingVoucherItem: '/bl-server/api/receivingVoucherItems',
}

/**
 * BridalLive `pos-transaction-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/pos-transaction-controller
 */
const POS_TRANSACTIONS_ENDPOINTS = {
  allPosTransactions: '/bl-server/api/posTransactions/list?page=0',
  deletePosTransaction: '/bl-server/api/posTransactions',
  createPosTransaction: '/bl-server/api/posTransactions',
  updatePosTransaction: '/bl-server/api/posTransactions',
  addPaymentToPosTransaction: '/bl-server/api/posTransactions',
}

/**
 * BridalLive `pos-transaction-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/pos-transaction-controller
 */
const POS_TRANSACTION_ITEMS_ENDPOINTS = {
  allPosTransactionItems: '/bl-server/api/posTransactionItems/list?page=0',
  deletePosTransactionItem: '/bl-server/api/posTransactionItems',
  createPosTransactionItem: '/bl-server/api/posTransactionItems',
}

/**
 * BridalLive `payment-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/payment-controller
 */
const PAYMENTS_ENDPOINTS = {
  allPayments: '/bl-server/api/payments/list?page=0',
  deletePayment: '/bl-server/api/payments',
  createPayment: '/bl-server/api/payments',
}

/**
 * BridalLive `contact-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/contact-controller
 */
const CONTACTS_ENDPOINTS = {
  allContacts: '/bl-server/api/contacts/list?page=0',
  deleteContact: '/bl-server/api/contacts',
}

/**
 * BridalLive `vendor-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/vendor-controller
 */
const VENDORS_ENDPOINTS = {
  allVendors: '/bl-server/api/vendors/list?page=0',
  deleteVendor: '/bl-server/api/vendors',
  createVendor: '/bl-server/api/vendors',
}

const DATE_CRITERIA_FORMAT = 'YYYY-MM-DD'
const MONTH_LABEL_FORMAT = 'YYYY-MM'

const safeFetch = (url: string, options: any) => {
  const isCustomerAction = global[GLOBAL_IS_CUSTOMER_ACTION_KEY]
  if (isCustomerAction && url.startsWith(BL_PROD_ROOT_URL)) {
    logDebug(`...customer request: ${url}`)
    return fetch(url, options)
  } else if (!isCustomerAction && url.startsWith(BL_QA_ROOT_URL)) {
    logDebug(`...non-customer request: ${url}`)
    return fetch(url, options)
  } else {
    const error = `BridalLive API URL mismatch. This ${
      isCustomerAction ? 'IS' : 'IS NOT'
    } a customer action, but it is using the wrong BridalLive environment: ${url}`
    logSevereError(error, undefined)
    throw new Error(error)
  }
}

const _validDemoAccount = (companyName: string, emailAddress: string) => {
  const foundIdx = Object.values(BL_DEMO_ACCTS).findIndex(
    (demoAcct) =>
      demoAcct.accountValidation.companyName === companyName &&
      demoAcct.accountValidation.emailAddress === emailAddress
  )
  return foundIdx >= 0
}

const allowMutation = async (rootUrl: BL_ROOT_URL, token: BridalLiveToken) => {
  // only allow a mutation in the QA BridalLive environment
  if (rootUrl !== BL_QA_ROOT_URL) return false

  try {
    const company = await fetchBridalLiveCompany(rootUrl, token)
    if (!_validDemoAccount(company.name, company.emailAddress))
      throw new Error()

    return true
  } catch (error) {
    logSevereError(
      `You are attempting to mutate a BridalLive account that DOES NOT match the demo BridalLive accounts. See 'settings.BL_DEMO_ACCTS'.`,
      {
        apiRootUrl: rootUrl,
      }
    )
    return false
  }
}

const authenticate = async (
  rootUrl: BL_ROOT_URL,
  retailerId: string,
  apiKey: string
) => {
  if (!retailerId || !apiKey || retailerId === '' || apiKey === '') {
    throw new Error('Missing retailer ID or API key')
  }
  return safeFetch(rootUrl + LOGIN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      retailerId: retailerId,
      apiKey: apiKey,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.hasOwnProperty('token')) {
        return data.token
      } else {
        throw data
      }
    })
    .catch((error) => {
      throw error
    })
}

const fetchAllData = async <T, F>(
  rootUrl: BL_ROOT_URL,
  endPoint: string,
  token: BridalLiveToken,
  filterCriteria: F
): Promise<T[]> => {
  if (!token || token === '') {
    throw new Error(
      `Cannot fetch all without a valid token. Endpoint: ${endPoint}`
    )
  }

  return safeFetch(rootUrl + endPoint, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else if (data.result) return data.result as T[]
      else return data as T[]
    })
    .catch(() => {
      throw new Error(`Failed to fetch all. Endpoint: ${endPoint}`)
    })
}

const fetchData = async <T>(
  rootUrl: BL_ROOT_URL,
  endPoint: string,
  token: BridalLiveToken,
  dataId: string | number
): Promise<T> => {
  if (!token || token === '') {
    logError(
      `Cannot fetch data without a valid token. Endpoint: ${endPoint}`,
      null
    )
    throw new Error(
      `Cannot fetch all without a valid token. Endpoint: ${endPoint}`
    )
  }

  return safeFetch(rootUrl + `${endPoint}/${dataId.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data) return data as T
    })
    .catch((error) => {
      logError(`Failed to fetch data. Endpoint: ${endPoint}`, error)
      throw new Error(`Failed to fetch data. Endpoint: ${endPoint}`)
    })
}

const deleteData = async <T>(
  rootUrl: BL_ROOT_URL,
  endPoint: string,
  token: BridalLiveToken,
  dataId: string | number
): Promise<T> => {
  if (!token || token === '') {
    logError(
      `Cannot delete data without a valid token. Endpoint: ${endPoint}`,
      null
    )
    throw new Error(
      `Cannot delete data without a valid token. Endpoint: ${endPoint}`
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(rootUrl + `${endPoint}/${dataId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
    body: {},
  }).then((data) => {
    if (data.errors && data.errors.length > 0) {
      throw data
    } else {
      return data as T
    }
  })
}

const createData = async <T>(
  rootUrl: BL_ROOT_URL,
  endPoint: string,
  token: BridalLiveToken,
  data: T
): Promise<T> => {
  if (endPoint === PURCHASE_ORDER_ITEMS_ENDPOINTS.createPurchaseOrderItem) {
    console.log('In Create Data for PO Item')
  }
  if (!token || token === '') {
    logError(
      `Cannot create data without a valid token. Endpoint: ${endPoint}`,
      null
    )
    throw new Error(
      `Cannot create data without a valid token. Endpoint: ${endPoint}`
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(rootUrl + endPoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (endPoint === PURCHASE_ORDER_ITEMS_ENDPOINTS.createPurchaseOrderItem) {
        console.log('received data:')
        console.log(data)
      }
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data as T
      }
    })
    .catch((error) => {
      logError(`Failed to create data. Endpoint: ${endPoint}`, error)
      throw new Error(`Failed to create data. Endpoint: ${endPoint}`)
    })
}

const updateData = async <T extends BaseBridalLiveObject>(
  rootUrl: BL_ROOT_URL,
  endPoint: string,
  token: BridalLiveToken,
  data: T
): Promise<T> => {
  if (!token || token === '') {
    logError(
      `Cannot udate data without a valid token. Endpoint: ${endPoint}`,
      null
    )
    throw new Error(
      `Cannot update data without a valid token. Endpoint: ${endPoint}`
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  if (!data.id) {
    logError(
      `Cannot udate data without a valid ID. Endpoint: ${endPoint}`,
      null
    )
    throw new Error(
      `Cannot udate data without a valid ID. Endpoint: ${endPoint}`
    )
  }

  return safeFetch(rootUrl + `${endPoint}/${data.id.toString()}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError(`Failed to udate data. Endpoint: ${endPoint}`, error)
      throw new Error(`Failed to udate data. Endpoint: ${endPoint}`)
    })
}

/**
 * Fetch BridalLive items. Uses the items/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller/list
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<FullBridalLiveItem[]> => {
  return fetchAllData<FullBridalLiveItem, ItemListCriteria>(
    rootUrl,
    ITEM_ENDPOINTS.allItems,
    token,
    filterCriteria
  )
}

/**
 * Fetch BridalLive item by id. Uses the items/{id} endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller/get
 * @param token BridalLive token used to authenticate the request
 * @param itemId ID of the item to fetch
 */
const fetchItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemId: string | number
): Promise<BridalLiveItem> => {
  return fetchData<BridalLiveItem>(
    rootUrl,
    ITEM_ENDPOINTS.getItem,
    token,
    itemId
  )
}

/**
 * Detele BridalLive item by id. Uses the items/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param itemId ID of the item to fetch
 */
const deleteItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemId: string | number
): Promise<BridalLiveItem> => {
  return deleteData<BridalLiveItem>(
    rootUrl,
    ITEM_ENDPOINTS.deleteItem,
    token,
    itemId
  )
}

const updateItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  return updateData<BridalLiveItem>(
    rootUrl,
    ITEM_ENDPOINTS.updateItem,
    token,
    item
  )
}

const createItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  return createData<BridalLiveItem>(
    rootUrl,
    ITEM_ENDPOINTS.createItem,
    token,
    item
  )
}
/**
 * Fetch BridalLive purchaseOrders. Uses the purchaseOrders/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPurchaseOrders = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLivePurchaseOrder[]> => {
  return fetchAllData<BridalLivePurchaseOrder, ItemListCriteria>(
    rootUrl,
    PURCHASE_ORDERS_ENDPOINTS.allPurchaseOrders,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive purchaseOrder by id. Uses the purchaseOrders/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchaseOrder-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param purchaseOrderId ID of the purchaseOrder to fetch
 */
const deletePurchaseOrder = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  purchaseOrderId: string | number
): Promise<BridalLivePurchaseOrder> => {
  return deleteData<BridalLivePurchaseOrder>(
    rootUrl,
    PURCHASE_ORDERS_ENDPOINTS.deletePurchaseOrder,
    token,
    purchaseOrderId
  )
}

const createPurchaseOrder = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  purchaseOrder: BridalLivePurchaseOrder
): Promise<BridalLivePurchaseOrder> => {
  return createData<BridalLivePurchaseOrder>(
    rootUrl,
    PURCHASE_ORDERS_ENDPOINTS.createPurchaseOrder,
    token,
    purchaseOrder
  )
}

const createPurchaseOrderForItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  vendorId: string,
  employeeId: string,
  itemIds: number[]
) => {
  if (!token || token === '') {
    logError('Cannot create a Purchase Order data without a valid token', null)
    throw new Error('Cannot create a Purchase Order data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${PURCHASE_ORDERS_ENDPOINTS.createPurchaseOrderForItem}/${vendorId}/${employeeId}`,
    {
      method: 'POST',
      body: JSON.stringify(itemIds),
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to fetch Purchase Order data', error)
      throw new Error('Failed to fetch Purchase Order data')
    })
}

const updatePurchaseOrder = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  purchaseOrder: BridalLivePurchaseOrder
): Promise<BridalLivePurchaseOrder> => {
  return updateData<BridalLivePurchaseOrder>(
    rootUrl,
    PURCHASE_ORDERS_ENDPOINTS.updatePurchaseOrder,
    token,
    purchaseOrder
  )
}
/**
 * Fetch BridalLive purchaseOrderItemss. Uses the purchaseOrderItemss/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-item-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPurchaseOrderItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLivePurchaseOrderItem[]> => {
  return fetchAllData<BridalLivePurchaseOrderItem, ItemListCriteria>(
    rootUrl,
    PURCHASE_ORDER_ITEMS_ENDPOINTS.allPurchaseOrderItems,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive purchaseOrderItem by id. Uses the purchaseOrderItems/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchaseOrderItem-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param purchaseOrderItemId ID of the purchaseOrderItem to fetch
 */
const deletePurchaseOrderItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  purchaseOrderItemId: string | number
): Promise<BridalLivePurchaseOrderItem> => {
  return deleteData<BridalLivePurchaseOrderItem>(
    rootUrl,
    PURCHASE_ORDER_ITEMS_ENDPOINTS.deletePurchaseOrderItem,
    token,
    purchaseOrderItemId
  )
}

const createPurchaseOrderItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  purchaseOrderItem: BridalLivePurchaseOrderItem
): Promise<BridalLivePurchaseOrderItem> => {
  return createData<BridalLivePurchaseOrderItem>(
    rootUrl,
    PURCHASE_ORDER_ITEMS_ENDPOINTS.createPurchaseOrderItem,
    token,
    purchaseOrderItem
  )
}

const createReceivingVoucherForPOItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  vendorId: string,
  employeeId: string,
  poItems: BridalLivePurchaseOrderItem[]
) => {
  if (!token || token === '') {
    logError(
      'Cannot create a Receiving Voucher data without a valid token',
      null
    )
    throw new Error(
      'Cannot create a Receiving Voucher data without a valid token'
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${RECEIVING_VOUCHERS_ENDPOINTS.createReceivingVoucherForPOItems}/${employeeId}/${vendorId}`,
    {
      method: 'POST',
      body: JSON.stringify(poItems),
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to fetch Receiving Voucher data', error)
      throw new Error('Failed to fetch Receiving Voucher data')
    })
}

const updateReceivingVoucher = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucher: BridalLiveReceivingVoucher
): Promise<BridalLiveReceivingVoucher> => {
  return updateData<BridalLiveReceivingVoucher>(
    rootUrl,
    RECEIVING_VOUCHERS_ENDPOINTS.updateReceivingVoucher,
    token,
    receivingVoucher
  )
}

/**
 * Fetch BridalLive receivingVouchers. Uses the receivingVouchers/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllReceivingVouchers = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveReceivingVoucher[]> => {
  return fetchAllData<BridalLiveReceivingVoucher, ItemListCriteria>(
    rootUrl,
    RECEIVING_VOUCHERS_ENDPOINTS.allReceivingVouchers,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive receivingVoucher by id. Uses the receivingVouchers/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/receivingVoucher-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param receivingVoucherId ID of the receivingVoucher to fetch
 */
const deleteReceivingVoucher = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucherId: string | number
): Promise<BridalLiveReceivingVoucher> => {
  return deleteData<BridalLiveReceivingVoucher>(
    rootUrl,
    RECEIVING_VOUCHERS_ENDPOINTS.deleteReceivingVoucher,
    token,
    receivingVoucherId
  )
}

const completeReceivingVoucher = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucherId: string | number
): Promise<BridalLiveReceivingVoucher> => {
  if (!token || token === '') {
    logError(
      'Cannot complete a Receiving Voucher data without a valid token',
      null
    )
    throw new Error(
      'Cannot complete a Receiving Voucher data without a valid token'
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${
        RECEIVING_VOUCHERS_ENDPOINTS.updateReceivingVoucher
      }/${receivingVoucherId.toString()}/complete`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to complete Receiving Voucher data', error)
      throw new Error('Failed to complete Receiving Voucher data')
    })
}

const createReceivingVoucher = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucher: BridalLiveReceivingVoucher
): Promise<BridalLiveReceivingVoucher> => {
  return createData<BridalLiveReceivingVoucher>(
    rootUrl,
    RECEIVING_VOUCHERS_ENDPOINTS.createReceivingVoucher,
    token,
    receivingVoucher
  )
}

// RECEIVING_VOUCHER_ITEMS_ENDPOINTS
/**
 * Fetch BridalLive receivingVoucherItems. Uses the receivingVoucherItems/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllReceivingVoucherItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveReceivingVoucherItem[]> => {
  return fetchAllData<BridalLiveReceivingVoucherItem, ItemListCriteria>(
    rootUrl,
    RECEIVING_VOUCHER_ITEMS_ENDPOINTS.allReceivingVoucherItems,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive receivingVoucherItem by id. Uses the receivingVoucherItems/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/receivingVoucherItem-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param receivingVoucherItemId ID of the receivingVoucherItem to fetch
 */
const deleteReceivingVoucherItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucherItemId: string | number
): Promise<BridalLiveReceivingVoucherItem> => {
  return deleteData<BridalLiveReceivingVoucherItem>(
    rootUrl,
    RECEIVING_VOUCHER_ITEMS_ENDPOINTS.deleteReceivingVoucherItem,
    token,
    receivingVoucherItemId
  )
}

const createReceivingVoucherItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  receivingVoucher: BridalLiveReceivingVoucherItem
): Promise<BridalLiveReceivingVoucherItem> => {
  return createData<BridalLiveReceivingVoucherItem>(
    rootUrl,
    RECEIVING_VOUCHER_ITEMS_ENDPOINTS.createReceivingVoucherItem,
    token,
    receivingVoucher
  )
}

/**
 * Fetch BridalLive posTransactions. Uses the posTransactions/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPosTransactions = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLivePosTransaction[]> => {
  return fetchAllData<BridalLivePosTransaction, ItemListCriteria>(
    rootUrl,
    POS_TRANSACTIONS_ENDPOINTS.allPosTransactions,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive posTransaction by id. Uses the posTransactions/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/posTransaction-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param posTransactionId ID of the posTransaction to fetch
 */
const deletePosTransaction = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  posTransactionId: string | number
): Promise<BridalLivePosTransaction> => {
  return deleteData<BridalLivePosTransaction>(
    rootUrl,
    POS_TRANSACTIONS_ENDPOINTS.deletePosTransaction,
    token,
    posTransactionId
  )
}

const createPosTransaction = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  posTransaction: BridalLivePosTransaction
): Promise<BridalLivePosTransaction> => {
  return createData<BridalLivePosTransaction>(
    rootUrl,
    POS_TRANSACTIONS_ENDPOINTS.createPosTransaction,
    token,
    posTransaction
  )
}

/**
 * Fetch BridalLive posTransactionLineItemLineItems. Uses the posTransactionLineItemLineItems/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPosTransactionItems = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLivePosTransactionLineItem[]> => {
  return fetchAllData<BridalLivePosTransactionLineItem, ItemListCriteria>(
    rootUrl,
    POS_TRANSACTION_ITEMS_ENDPOINTS.allPosTransactionItems,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive posTransactionItem by id. Uses the posTransactionItems/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/posTransactionItem-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param posTransactionItemId ID of the posTransactionItem to fetch
 */
const deletePosTransactionItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  posTransactionItemId: string | number
): Promise<BridalLivePosTransactionLineItem> => {
  return deleteData<BridalLivePosTransactionLineItem>(
    rootUrl,
    POS_TRANSACTION_ITEMS_ENDPOINTS.deletePosTransactionItem,
    token,
    posTransactionItemId
  )
}
const createPosTransactionItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  posTransactionItem: BridalLivePosTransactionLineItem
): Promise<BridalLivePosTransactionLineItem> => {
  return createData<BridalLivePosTransactionLineItem>(
    rootUrl,
    POS_TRANSACTION_ITEMS_ENDPOINTS.createPosTransactionItem,
    token,
    posTransactionItem
  )
}
/**
 * Fetch BridalLive payments. Uses the payments/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPayments = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLivePayment[]> => {
  return fetchAllData<BridalLivePayment, ItemListCriteria>(
    rootUrl,
    PAYMENTS_ENDPOINTS.allPayments,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive payment by id. Uses the payments/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/payment-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param paymentId ID of the payment to fetch
 */
const deletePayment = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  paymentId: string | number
): Promise<BridalLivePayment> => {
  return deleteData<BridalLivePayment>(
    rootUrl,
    PAYMENTS_ENDPOINTS.deletePayment,
    token,
    paymentId
  )
}

const createPayment = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  payment: BridalLivePayment
): Promise<BridalLivePayment> => {
  return createData<BridalLivePayment>(
    rootUrl,
    PAYMENTS_ENDPOINTS.createPayment,
    token,
    payment
  )
}

const addPaymentToPosTransaction = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  payment: BridalLivePayment
): Promise<BridalLivePayment> => {
  if (!token || token === '') {
    logError('Cannot add Payment data without a valid token', null)
    throw new Error('Cannot add Payment data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  logInfo('Payment payload')
  logInfo(payment)

  return safeFetch(
    rootUrl +
      `${POS_TRANSACTIONS_ENDPOINTS.addPaymentToPosTransaction}/${payment.transactionId}/addPayment`,
    {
      method: 'POST',
      body: JSON.stringify(payment),
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      logInfo('Response from add payment')
      logInfo(data)
      return data
    })
    .catch((error) => {
      logError('Failed to add Payment data', error)
      throw new Error('Failed to add Payment data')
    })
}

const completePosTransaction = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  posTransactionId: string | number,
  employeeId: string | number
): Promise<BridalLivePosTransaction> => {
  if (!token || token === '') {
    logError(
      'Cannot complete a POS Transaction data without a valid token',
      null
    )
    throw new Error(
      'Cannot complete aPOS Transaction data without a valid token'
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  // https://qa.bridallive.com/bl-server/api/posTransactions/653346/completeTransaction/6625
  return safeFetch(
    rootUrl +
      `${
        POS_TRANSACTIONS_ENDPOINTS.updatePosTransaction
      }/${posTransactionId.toString()}/completeTransaction/${employeeId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to complete POS Transaction data', error)
      throw new Error('Failed to complete POS Transaction data')
    })
}
/**
 * Fetch BridalLive contacts. Uses the contacts/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllContacts = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveContact[]> => {
  return fetchAllData<BridalLiveContact, ItemListCriteria>(
    rootUrl,
    CONTACTS_ENDPOINTS.allContacts,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive contact by id. Uses the contacts/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/contact-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param contactId ID of the contact to fetch
 */
const deleteContact = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  contactId: string | number
): Promise<BridalLiveContact> => {
  if (!token || token === '') {
    logError('Cannot delete Contact data without a valid token', null)
    throw new Error('Cannot delete Contact data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl + `${CONTACTS_ENDPOINTS.deleteContact}/${contactId.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  ).then((data) => {
    if (data.errors && data.errors.length > 0) {
      throw data
    } else {
      return data
    }
  })
}

/**
 * Fetch BridalLive vendors. Uses the vendors/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllVendors = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveVendor[]> => {
  return fetchAllData<BridalLiveVendor, ItemDetailsForLookbookCriteria>(
    rootUrl,
    VENDORS_ENDPOINTS.allVendors,
    token,
    filterCriteria
  )
}

/**
 * Detele BridalLive vendor by id. Uses the vendors/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/vendor-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param vendorId ID of the vendor to fetch
 */
const deleteVendor = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  vendorId: string | number
): Promise<BridalLiveVendor> => {
  return deleteData<BridalLiveVendor>(
    rootUrl,
    VENDORS_ENDPOINTS.deleteVendor,
    token,
    vendorId
  )
}

const createVendor = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  vendor: BridalLiveVendor
): Promise<BridalLiveVendor> => {
  return createData<BridalLiveVendor>(
    rootUrl,
    VENDORS_ENDPOINTS.createVendor,
    token,
    vendor
  )
}

/**
 * Fetch BridalLive transactionItemJournals. Uses the transactionItemJournals/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllTransactionItemJournals = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveItemTransaction[]> => {
  return fetchAllData<BridalLiveItemTransaction, ItemListCriteria>(
    rootUrl,
    SALES_REPORT_ENDPOINTS.transactionItemJournal,
    token,
    filterCriteria
  )
}

const fetchAllAttributesByItem = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemDetailsForLookbookCriteria
) => {
  return fetchAllData<LookbookAttribute, ItemDetailsForLookbookCriteria>(
    rootUrl,
    ITEM_ATTRIBUTE_ENDPOINTS.allItemAttributes,
    token,
    filterCriteria
  )
}

const createAttribute = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemAttribute: LookbookAttribute
): Promise<LookbookAttribute> => {
  return createData<LookbookAttribute>(
    rootUrl,
    ITEM_ATTRIBUTE_ENDPOINTS.createItemAttributes,
    token,
    itemAttribute
  )
}

/**
 * Detele BridalLive item by id. Uses the items/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param itemId ID of the item to fetch
 */
const deleteItemAttribute = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemId: string | number
): Promise<LookbookAttribute> => {
  return deleteData<LookbookAttribute>(
    rootUrl,
    ITEM_ATTRIBUTE_ENDPOINTS.deleteItemAttributes,
    token,
    itemId
  )
}

/**
 * Fetch a list of BridalLive item images. Uses the item picture endpoint and
 * returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-picture-controller
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllItemImages = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemImagesCriteria
) => {
  return fetchAllData<BridalLiveItemImage, ItemImagesCriteria>(
    rootUrl,
    ITEM_PICTURE_ENDPOINTS.allPictures,
    token,
    filterCriteria
  )
}

const createItemImage = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemImage: BridalLiveItemImage
): Promise<BridalLiveItemImage> => {
  return createData<BridalLiveItemImage>(
    rootUrl,
    ITEM_PICTURE_ENDPOINTS.createPicture,
    token,
    itemImage
  )
}

/**
 * Detele BridalLive itemImage by id. Uses the itemImages/{id} endpoint.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/itemImage-controller/deleteUsingDELETE_32
 * @param token BridalLive token used to authenticate the request
 * @param itemImageId ID of the itemImage to fetch
 */
const deleteItemImage = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  itemImageId: string | number
): Promise<BridalLiveItemImage> => {
  return deleteData<BridalLiveItemImage>(
    rootUrl,
    ITEM_PICTURE_ENDPOINTS.deletePicture,
    token,
    itemImageId
  )
}

/**
 * Fetch BridalLiveCompany item for retailerId and apiKey.
 * Uses the BridalLive `company-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/company-controller
 * @param token BridalLive token used to authenticate the request
 */
const fetchBridalLiveCompany = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken
): Promise<BridalLiveCompany> => {
  if (!token || token === '') {
    logError('Cannot fetch BridalLive Company data without a valid token', null)
    throw new Error(
      'Cannot fetch BridalLive Company data without a valid token'
    )
  }
  return safeFetch(rootUrl + COMPANY_ENDPOINTS.company, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data) return data
    })
    .catch((error) => {
      logError('Failed to fetch BridalLive Company data', error)
      throw new Error('Failed to fetch BridalLive Company data')
    })
}

export default {
  MONTH_LABEL_FORMAT,
  DATE_CRITERIA_FORMAT,
  authenticate,
  fetchAllItems,
  fetchItem,
  deleteItem,
  createItem,
  fetchAllPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderForItems,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchAllPurchaseOrderItems,
  deletePurchaseOrderItem,
  createPurchaseOrderItem,
  fetchAllReceivingVouchers,
  deleteReceivingVoucher,
  createReceivingVoucher,
  createReceivingVoucherForPOItems,
  updateReceivingVoucher,
  fetchAllReceivingVoucherItems,
  deleteReceivingVoucherItem,
  createReceivingVoucherItem,
  updateItem,
  completeReceivingVoucher,
  fetchAllPosTransactions,
  deletePosTransaction,
  createPosTransaction,
  fetchAllPosTransactionItems,
  deletePosTransactionItem,
  createPosTransactionItem,
  fetchAllPayments,
  deletePayment,
  createPayment,
  addPaymentToPosTransaction,
  completePosTransaction,
  fetchAllContacts,
  deleteContact,
  fetchAllVendors,
  deleteVendor,
  createVendor,
  fetchBridalLiveCompany,
  fetchAllTransactionItemJournals,
  fetchAllItemImages,
  createItemImage,
  deleteItemImage,
  fetchAllAttributesByItem,
  createAttribute,
}
