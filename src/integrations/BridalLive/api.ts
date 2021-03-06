// TODO: Combine this file and `app/integrations/BridalLive/api`, as well as
// BridalLive types, in a single node package that app & functions can import

import fetch from 'node-fetch'
import { logDebug, logError, logSevereError } from '../../logger'
import {
  BL_DEMO_ACCT_VALIDATION,
  BL_PROD_ROOT_URL,
  BL_QA_ROOT_URL,
  GLOBAL_IS_CUSTOMER_ACTION_KEY,
} from '../../settings'
import {
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
  BridalLiveResponse,
  BridalLiveToken,
  BridalLiveVendor,
  FullBridalLiveItem,
  ItemDetailsForLookbookCriteria,
  ItemImagesCriteria,
  ItemListCriteria,
} from './apiTypes'

export type FetchAllFunction =
  | typeof fetchAllContacts
  | typeof fetchAllItems
  | typeof fetchAllPayments
  | typeof fetchAllPosTransactionItems
  | typeof fetchAllPosTransactions
  | typeof fetchAllPurchaseOrders
  | typeof fetchAllReceivingVouchers
  | typeof fetchAllTransactionItemJournals
  | typeof fetchAllVendors

export type DeleteFunction =
  | typeof deleteContact
  | typeof deleteItem
  | typeof deletePayment
  | typeof deletePosTransaction
  | typeof deletePurchaseOrder
  | typeof deleteReceivingVoucher
  | typeof deleteVendor

export type CreateFunction =
  // | typeof createContact
  | typeof createItem
  // | typeof createPayment
  // | typeof createPosTransaction
  // | typeof createPurchaseOrder
  // | typeof createReceivingVoucher
  | typeof createVendor

type BL_ROOT_URL = typeof BL_QA_ROOT_URL | typeof BL_PROD_ROOT_URL

// const ROOT_URL = 'https://app.bridallive.com'
// const QA_ROOT_URL = 'https://qa.bridallive.com'
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
}

// /**
//  * BridalLive `purchase-reports-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-reports-controller
//  */
// const PURCHASE_REPORTS_ENDPOINTS = {
//   receivingReport: '/bl-server/api/reports/purchasingReports/receivingReport'
// }

// /**
//  * BridalLive `purchase-order-item-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-item-controller
//  */
// const PURCHASE_ORDER_ITEMS_ENDPOINTS = {
//   allPurchaseOrderItems: '/bl-server/api/purchaseOrderItems/list'
// }

/**
 * BridalLive `purchase-order-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller
 */
const PURCHASE_ORDERS_ENDPOINTS = {
  allPurchaseOrders: '/bl-server/api/purchaseOrders/list?page=0',
  createPurchaseOrderForItem: '/bl-server/api/purchaseOrders/createPOForItems',
  updatePurchaseOrder: `/bl-server/api/purchaseOrders/:purchaseOrderId`,
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
  deleteReceivingVoucher: '/bl-server/api/receivingVouchers',
}

/**
 * BridalLive `pos-transaction-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/pos-transaction-controller
 */
const POS_TRANSACTIONS_ENDPOINTS = {
  allPosTransactions: '/bl-server/api/posTransactions/list?page=0',
  deletePosTransaction: '/bl-server/api/posTransactions',
}

/**
 * BridalLive `pos-transaction-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/pos-transaction-controller
 */
const POS_TRANSACTION_ITEMS_ENDPOINTS = {
  allPosTransactionItems: '/bl-server/api/posTransactionItems/list?page=0',
  // deletePosTransactionLineItem: '/bl-server/api/posTransactionItems',
}

/**
 * BridalLive `payment-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/payment-controller
 */
const PAYMENTS_ENDPOINTS = {
  allPayments: '/bl-server/api/payments/list?page=0',
  deletePayment: '/bl-server/api/payments',
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

const allowMutation = async (rootUrl: BL_ROOT_URL, token: BridalLiveToken) => {
  // only allow a mutation in the QA BridalLive environment
  if (rootUrl !== BL_QA_ROOT_URL) return false

  try {
    const company = await fetchBridalLiveCompany(rootUrl, token)
    const isDemoAccount =
      company.name === BL_DEMO_ACCT_VALIDATION.companyName &&
      company.emailAddress === BL_DEMO_ACCT_VALIDATION.emailAddress
    if (!isDemoAccount) throw new Error()

    return true
  } catch (error) {
    logSevereError(
      `You are attempting to mutate a BridalLive account that DOES NOT match the demo BridalLive account. See 'settings.BL_DEMO_ACCT_VALIDATION'.`,
      {
        expectedCompanyName: BL_DEMO_ACCT_VALIDATION.companyName,
        expectedCompanyEmail: BL_DEMO_ACCT_VALIDATION.emailAddress,
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
  if (!token || token === '') {
    throw new Error('Cannot fetch Item list data without a valid token')
  }

  return safeFetch(rootUrl + ITEM_ENDPOINTS.allItems, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as FullBridalLiveItem[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Item list data')
    })
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
  if (!token || token === '') {
    logError('Cannot fetch Item data without a valid token', null)
    throw new Error('Cannot fetch Item data without a valid token')
  }

  return safeFetch(rootUrl + `${ITEM_ENDPOINTS.getItem}/${itemId.toString()}`, {
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
      logError('Failed to fetch Item data', error)
      throw new Error('Failed to fetch Item data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete Item data without a valid token', null)
    throw new Error('Cannot delete Item data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl + `${ITEM_ENDPOINTS.deleteItem}/${itemId.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: {},
    }
  ).then((data) => {
    if (data.errors && data.errors.length > 0) {
      throw data
    } else {
      return data
    }
  })
}

const updateItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot update an Item data without a valid token', null)
    throw new Error('Cannot update an Item data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  if (!item.id) {
    logError('Cannot update Item data without a valid Item ID', null)
    throw new Error('Cannot update Item data without a valid Item ID')
  }

  return safeFetch(
    rootUrl + `${ITEM_ENDPOINTS.updateItem}/${item.id.toString()}`,
    {
      method: 'PUT',
      body: JSON.stringify(item),
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
      logError('Failed to fetch Item data', error)
      throw new Error('Failed to update Item data')
    })
}

const createItem = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot create an Item data without a valid token', null)
    throw new Error('Cannot create an Item without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(rootUrl + `${ITEM_ENDPOINTS.createItem}`, {
    method: 'POST',
    body: JSON.stringify(item),
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
      logError('Failed to create Item data', error)
      throw new Error('Failed to create Item data')
    })
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
  if (!token || token === '') {
    throw new Error(
      'Cannot fetch Purchase Order list data without a valid token'
    )
  }

  return safeFetch(rootUrl + PURCHASE_ORDERS_ENDPOINTS.allPurchaseOrders, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLivePurchaseOrder[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Purchase Order list data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete PurchaseOrder data without a valid token', null)
    throw new Error('Cannot delete PurchaseOrder data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${
        PURCHASE_ORDERS_ENDPOINTS.deletePurchaseOrder
      }/${purchaseOrderId.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: {},
    }
  ).then((data) => {
    if (data.errors && data.errors.length > 0) {
      throw data
    } else {
      return data
    }
  })
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
  if (!token || token === '') {
    logError('Cannot update a Purchase Order without a valid token', null)
    throw new Error('Cannot update a Purchase Order without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      PURCHASE_ORDERS_ENDPOINTS.updatePurchaseOrder.replace(
        ':purchaseOrderId',
        purchaseOrder.id.toString()
      ),
    {
      method: 'PUT',
      body: JSON.stringify(purchaseOrder),
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
      logError('Failed to update Purchase Order data', error)
      throw new Error('Failed to update Purchase Order data')
    })
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
): Promise<string | object> => {
  if (!token || token === '') {
    logError(
      'Cannot update a Receiving Voucher data without a valid token',
      null
    )
    throw new Error(
      'Cannot update a Receiving Voucher data without a valid token'
    )
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${
        RECEIVING_VOUCHERS_ENDPOINTS.updateReceivingVoucher
      }/${receivingVoucher.id.toString()}`,
    {
      method: 'PUT',
      body: JSON.stringify(receivingVoucher),
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
      logError('Failed to update Receiving Voucher data', error)
      throw new Error('Failed to update Receiving Voucher data')
    })
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
  if (!token || token === '') {
    throw new Error(
      'Cannot fetch ReceivingVoucher list data without a valid token'
    )
  }

  return safeFetch(
    rootUrl + RECEIVING_VOUCHERS_ENDPOINTS.allReceivingVouchers,
    {
      method: 'POST',
      body: JSON.stringify(filterCriteria),
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLiveReceivingVoucher[]
    })
    .catch(() => {
      throw new Error('Failed to fetch ReceivingVoucher list data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete ReceivingVoucher data without a valid token', null)
    throw new Error('Cannot delete ReceivingVoucher data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${
        RECEIVING_VOUCHERS_ENDPOINTS.deleteReceivingVoucher
      }/${receivingVoucherId.toString()}`,
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
  if (!token || token === '') {
    throw new Error(
      'Cannot fetch PosTransaction list data without a valid token'
    )
  }

  return safeFetch(rootUrl + POS_TRANSACTIONS_ENDPOINTS.allPosTransactions, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLivePosTransaction[]
    })
    .catch(() => {
      throw new Error('Failed to fetch PosTransaction list data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete PosTransaction data without a valid token', null)
    throw new Error('Cannot delete PosTransaction data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl +
      `${
        POS_TRANSACTIONS_ENDPOINTS.deletePosTransaction
      }/${posTransactionId.toString()}`,
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
  if (!token || token === '') {
    throw new Error(
      'Cannot fetch PosTransactionLineItem list data without a valid token'
    )
  }

  return safeFetch(
    rootUrl + POS_TRANSACTION_ITEMS_ENDPOINTS.allPosTransactionItems,
    {
      method: 'POST',
      body: JSON.stringify(filterCriteria),
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLivePosTransactionLineItem[]
    })
    .catch((error) => {
      console.log(error)
      throw new Error('Failed to fetch PosTransactionLineItem list data')
    })
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
  if (!token || token === '') {
    throw new Error('Cannot fetch Payment list data without a valid token')
  }

  return safeFetch(rootUrl + PAYMENTS_ENDPOINTS.allPayments, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLivePayment[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Purchase Order list data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete Payment data without a valid token', null)
    throw new Error('Cannot delete Payment data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl + `${PAYMENTS_ENDPOINTS.deletePayment}/${paymentId.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: {},
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
  if (!token || token === '') {
    throw new Error('Cannot fetch Contact list data without a valid token')
  }

  return safeFetch(rootUrl + CONTACTS_ENDPOINTS.allContacts, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLiveContact[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Purchase Order list data')
    })
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
  if (!token || token === '') {
    throw new Error('Cannot fetch Vendor list data without a valid token')
  }

  return safeFetch(rootUrl + VENDORS_ENDPOINTS.allVendors, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLiveVendor[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Purchase Order list data')
    })
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
  if (!token || token === '') {
    logError('Cannot delete Vendor data without a valid token', null)
    throw new Error('Cannot delete Vendor data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl + `${VENDORS_ENDPOINTS.deleteVendor}/${vendorId.toString()}`,
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

const createVendor = async (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  vendor: BridalLiveVendor
): Promise<BridalLiveVendor> => {
  if (!token || token === '') {
    logError('Cannot create an Vendor data without a valid token', null)
    throw new Error('Cannot create an Vendor without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(rootUrl + `${VENDORS_ENDPOINTS.createVendor}`, {
    method: 'POST',
    body: JSON.stringify(vendor),
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
      logError('Failed to create Vendor data', error)
      throw new Error('Failed to create Vendor data')
    })
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
  if (!token || token === '') {
    throw new Error(
      'Cannot fetch TransactionItemJournal list data without a valid token'
    )
  }

  return safeFetch(rootUrl + SALES_REPORT_ENDPOINTS.transactionItemJournal, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLiveItemTransaction[]
    })
    .catch(() => {
      throw new Error('Failed to fetch TransactionItemJournal list data')
    })
}

const fetchAllAttributesByItem = (
  rootUrl: BL_ROOT_URL,
  token: BridalLiveToken,
  filterCriteria: ItemDetailsForLookbookCriteria
) => {
  if (!token || token === '') {
    throw new Error('Cannot fetch attribute data without a valid token')
  }

  return safeFetch(rootUrl + ITEM_ENDPOINTS.allAttributes, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.attributes) return data.attributes
    })
    .catch(() => {
      throw new Error('Failed to fetch attribute data')
    })
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
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot delete Item data without a valid token', null)
    throw new Error('Cannot delete Item data without a valid token')
  }

  const allowMutate = await allowMutation(rootUrl, token)
  if (!allowMutate) return

  return safeFetch(
    rootUrl + `${ITEM_ENDPOINTS.deleteItem}/${itemId.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: {},
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
  if (!token || token === '') {
    throw new Error('Cannot fetch Item images without a valid token')
  }

  return safeFetch(rootUrl + ITEM_PICTURE_ENDPOINTS.allPictures, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data: BridalLiveResponse<BridalLiveItemImage>) => {
      return data.result
    })
    .catch(() => {
      throw new Error('Failed to fetch Item list data')
    })
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
  createPurchaseOrderForItems,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchAllReceivingVouchers,
  deleteReceivingVoucher,
  createReceivingVoucherForPOItems,
  updateReceivingVoucher,
  updateItem,
  completeReceivingVoucher,
  fetchAllPosTransactions,
  deletePosTransaction,
  fetchAllPosTransactionItems,
  fetchAllPayments,
  deletePayment,
  fetchAllContacts,
  deleteContact,
  fetchAllVendors,
  deleteVendor,
  createVendor,
  fetchBridalLiveCompany,
  fetchAllTransactionItemJournals,
  fetchAllItemImages,
  fetchAllAttributesByItem,
}
