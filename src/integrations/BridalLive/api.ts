// TODO: Combine this file and `app/integrations/BridalLive/api`, as well as
// BridalLive types, in a single node package that app & functions can import

import fetch from 'node-fetch'
import { logError } from '../../logger'
import { BL_ROOT_URL } from '../../settings'
import {
  BridalLiveApiCredentials,
  BridalLiveCompany,
  BridalLiveContact,
  BridalLiveItem,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePurchaseOrder,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucher,
  BridalLiveToken,
  FullBridalLiveItem,
  ItemListCriteria
} from './apiTypes'

// const ROOT_URL = 'https://app.bridallive.com'
// const QA_ROOT_URL = 'https://qa.bridallive.com'
const LOGIN_ENDPOINT = '/bl-server/api/auth/apiLogin'

/**
 * BridalLive `company-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/company-controller
 */
const COMPANY_ENDPOINTS = {
  company: '/bl-server/api/company'
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

// /**
//  * BridalLive `sales-reports-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/sales-reports-controller
//  */
// const SALES_REPORT_ENDPOINTS = {
//   byItem: '/bl-server/api/reports/salesReports/salesBy/itemName?',
//   byDept: '/bl-server/api/reports/salesReports/salesBy/departmentId?',
//   transactionItemJournal:
//     '/bl-server/api/reports/salesReports/transactionItemJournal?'
// }

/**
 * BridalLive `item-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller
 */
const ITEM_ENDPOINTS = {
  allItems: '/bl-server/api/items/list',
  updateItem: '/bl-server/api/items',
  getItem: '/bl-server/api/items',
  deleteItem: '/bl-server/api/items',
  allAttributes: '/bl-server/api/items/getItemDetailsForLookbook',
  updateItemAttributes: '/bl-server/api/itemItemAttributes' // UNDOCUMENTED, but used in Bridal Live app
}

// /**
//  * BridalLive `item-picture-controller`:
//  *
//  * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-picture-controller
//  */
// const ITEM_PICTURE_ENDPOINTS = {
//   allPictures: '/bl-server/api/itemPictures/list'
// }

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
  deleteReceivingVoucher: '/bl-server/api/receivingVouchers'
}

/**
 * BridalLive `pos-transaction-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/pos-transaction-controller
 */
const POS_TRANSACTIONS_ENDPOINTS = {
  allPosTransactions: '/bl-server/api/posTransactions/list?page=0',
  deletePosTransaction: '/bl-server/api/posTransactions'
}

/**
 * BridalLive `payment-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/payment-controller
 */
const PAYMENTS_ENDPOINTS = {
  allPayments: '/bl-server/api/payments/list?page=0',
  deletePayment: '/bl-server/api/payments'
}

/**
 * BridalLive `contact-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/contact-controller
 */
const CONTACTS_ENDPOINTS = {
  allContacts: '/bl-server/api/contacts/list?page=0',
  deleteContact: '/bl-server/api/contacts'
}

const DATE_CRITERIA_FORMAT = 'YYYY-MM-DD'
const MONTH_LABEL_FORMAT = 'YYYY-MM'

export const getApiCredentials = async (
  
  username: string,
  password: string
): Promise<BridalLiveApiCredentials> => {
  const response = await fetch(BL_ROOT_URL + '/bl-server/api/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  if (response.status === 200) {
    const json = await response.json()
    return {
      apiAccess: <boolean>json.license.apiAccess,
      apiKey: json.license.apiKey,
      retailerId: json.license.retailerId
    }
  } else if (response.status === 403) {
    throw new Error('Invalid Login Credentials')
  }

  throw new Error(await response.text())
}

const authenticate = (retailerId: string, apiKey: string) => {
  if (!retailerId || !apiKey || retailerId === '' || apiKey === '') {
    throw new Error('Missing retailer ID or API key')
  }
  return fetch(BL_ROOT_URL + LOGIN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      retailerId: retailerId,
      apiKey: apiKey
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.hasOwnProperty('token')) {
        return data.token
      } else {
        const errorMessage =
          data.errors?.code ||
          'Failed BridalLive authenticate for unknown reason.'
        throw new Error(errorMessage)
      }
    })
    .catch(error => {
      throw new Error(
        `Failed to authenticate. rootUrl: ${BL_ROOT_URL}. Error: ${error}`
      )
    })
}
/**
 * Fetch BridalLive items. Uses the items/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/item-controller/list
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllItems = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<FullBridalLiveItem[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch Item list data without a valid token')
  }

  return fetch(BL_ROOT_URL + ITEM_ENDPOINTS.allItems, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const fetchItem = (  
  token: BridalLiveToken,
  itemId: string | number
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot fetch Item data without a valid token', null, true)
    throw new Error('Cannot fetch Item data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${ITEM_ENDPOINTS.getItem}/${itemId.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data) return data
    })
    .catch(error => {
      logError('Failed to fetch Item data', error, true)
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
const deleteItem = (
  token: BridalLiveToken,
  itemId: string | number
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot delete Item data without a valid token', null, true)
    throw new Error('Cannot delete Item data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${ITEM_ENDPOINTS.deleteItem}/${itemId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    },
    body: {}
  })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data
      }
    })
}

const updateItem = (
  
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError(
      'Cannot update an Item data without a valid token',
      null,
      true
    )
    throw new Error('Cannot update an Item data without a valid token')
  }

  if (!item.id) {
    logError(
      'Cannot update Item data without a valid Item ID',
      null,
      true
    )
    throw new Error('Cannot update Item data without a valid Item ID')
  }

  return fetch(BL_ROOT_URL + `${ITEM_ENDPOINTS.updateItem}/${item.id.toString()}`, {
    method: 'PUT',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError('Failed to fetch Item data', error, true)
      throw new Error('Failed to update Item data')
    })
}


/**
 * Fetch BridalLive purchaseOrders. Uses the purchaseOrders/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPurchaseOrders = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<BridalLivePurchaseOrder[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch Purchase Order list data without a valid token')
  }

  return fetch(BL_ROOT_URL + PURCHASE_ORDERS_ENDPOINTS.allPurchaseOrders, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const deletePurchaseOrder = (
  token: BridalLiveToken,
  purchaseOrderId: string | number
): Promise<BridalLivePurchaseOrder> => {
  if (!token || token === '') {
    logError('Cannot delete PurchaseOrder data without a valid token', null, true)
    throw new Error('Cannot delete PurchaseOrder data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${PURCHASE_ORDERS_ENDPOINTS.deletePurchaseOrder}/${purchaseOrderId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    },
    body: {}
  })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data
      }
    })
}


const createPurchaseOrderForItems = (
  
  token: BridalLiveToken,
  vendorId: string,
  employeeId: string,
  itemIds: number[]
) => {
  if (!token || token === '') {
    logError(
      'Cannot create a Purchase Order data without a valid token',
      null,
      true
    )
    throw new Error('Cannot create a Purchase Order data without a valid token')
  }

  return fetch(
    BL_ROOT_URL +
      `${PURCHASE_ORDERS_ENDPOINTS.createPurchaseOrderForItem}/${vendorId}/${employeeId}`,
    {
      method: 'POST',
      body: JSON.stringify(itemIds),
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError(
        'Failed to fetch Purchase Order data',
        error,
        true
      )
      throw new Error('Failed to fetch Purchase Order data')
    })
}

const updatePurchaseOrder = (
  
  token: BridalLiveToken,
  purchaseOrder: BridalLivePurchaseOrder
): Promise<BridalLivePurchaseOrder> => {
  if (!token || token === '') {
    logError(
      'Cannot update a Purchase Order without a valid token',
      null,
      true
    )
    throw new Error('Cannot update a Purchase Order without a valid token')
  }

  return fetch(
    BL_ROOT_URL +
      PURCHASE_ORDERS_ENDPOINTS.updatePurchaseOrder.replace(
        ':purchaseOrderId',
        purchaseOrder.id.toString()
      ),
    {
      method: 'PUT',
      body: JSON.stringify(purchaseOrder),
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError(
        'Failed to update Purchase Order data',
        error,
        true
      )
      throw new Error('Failed to update Purchase Order data')
    })
}

const createReceivingVoucherForPOItems = (
  
  token: BridalLiveToken,
  vendorId: string,
  employeeId: string,
  poItems: BridalLivePurchaseOrderItem[]
) => {
  if (!token || token === '') {
    logError(
      'Cannot create a Receiving Voucher data without a valid token',
      null,
      true
    )
    throw new Error(
      'Cannot create a Receiving Voucher data without a valid token'
    )
  }

  return fetch(
    BL_ROOT_URL +
      `${RECEIVING_VOUCHERS_ENDPOINTS.createReceivingVoucherForPOItems}/${employeeId}/${vendorId}`,
    {
      method: 'POST',
      body: JSON.stringify(poItems),
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError(
        'Failed to fetch Receiving Voucher data',
        error,
        true
      )
      throw new Error('Failed to fetch Receiving Voucher data')
    })
}

const updateReceivingVoucher = (
  
  token: BridalLiveToken,
  receivingVoucher: BridalLiveReceivingVoucher
): Promise<string | object> => {
  if (!token || token === '') {
    logError(
      'Cannot update a Receiving Voucher data without a valid token',
      null,
      true
    )
    throw new Error(
      'Cannot update a Receiving Voucher data without a valid token'
    )
  }

  return fetch(
    BL_ROOT_URL +
      `${
        RECEIVING_VOUCHERS_ENDPOINTS.updateReceivingVoucher
      }/${receivingVoucher.id.toString()}`,
    {
      method: 'PUT',
      body: JSON.stringify(receivingVoucher),
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError(
        'Failed to update Receiving Voucher data',
        error,
        true
      )
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
const fetchAllReceivingVouchers = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<BridalLiveReceivingVoucher[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch ReceivingVoucher list data without a valid token')
  }

  return fetch(BL_ROOT_URL + RECEIVING_VOUCHERS_ENDPOINTS.allReceivingVouchers, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const deleteReceivingVoucher = (
  token: BridalLiveToken,
  receivingVoucherId: string | number
): Promise<BridalLiveReceivingVoucher> => {
  if (!token || token === '') {
    logError('Cannot delete ReceivingVoucher data without a valid token', null, true)
    throw new Error('Cannot delete ReceivingVoucher data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${RECEIVING_VOUCHERS_ENDPOINTS.deleteReceivingVoucher}/${receivingVoucherId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data
      }
    })
}


const completeReceivingVoucher = (
  
  token: BridalLiveToken,
  receivingVoucherId: string | number
): Promise<BridalLiveReceivingVoucher> => {
  if (!token || token === '') {
    logError(
      'Cannot complete a Receiving Voucher data without a valid token',
      null,
      true
    )
    throw new Error(
      'Cannot complete a Receiving Voucher data without a valid token'
    )
  }

  return fetch(
    BL_ROOT_URL +
      `${
        RECEIVING_VOUCHERS_ENDPOINTS.updateReceivingVoucher
      }/${receivingVoucherId.toString()}/complete`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      logError(
        'Failed to complete Receiving Voucher data',
        error,
        true
      )
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
const fetchAllPosTransactions = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<BridalLivePosTransaction[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch PosTransaction list data without a valid token')
  }

  return fetch(BL_ROOT_URL + POS_TRANSACTIONS_ENDPOINTS.allPosTransactions, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const deletePosTransaction = (
  token: BridalLiveToken,
  posTransactionId: string | number
): Promise<BridalLivePosTransaction> => {
  if (!token || token === '') {
    logError('Cannot delete PosTransaction data without a valid token', null, true)
    throw new Error('Cannot delete PosTransaction data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${POS_TRANSACTIONS_ENDPOINTS.deletePosTransaction}/${posTransactionId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data
      }
    })
}


/**
 * Fetch BridalLive payments. Uses the payments/list endpoint and returns the result.
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/purchase-order-controller/listUsingPOST_52
 * @param token BridalLive token used to authenticate the request
 * @param filterCriteria POST request body
 */
const fetchAllPayments = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<BridalLivePayment[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch Payment list data without a valid token')
  }

  return fetch(BL_ROOT_URL + PAYMENTS_ENDPOINTS.allPayments, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const deletePayment = (
  token: BridalLiveToken,
  paymentId: string | number
): Promise<BridalLivePayment> => {
  if (!token || token === '') {
    logError('Cannot delete Payment data without a valid token', null, true)
    throw new Error('Cannot delete Payment data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${PAYMENTS_ENDPOINTS.deletePayment}/${paymentId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    },
    body: {}
  })
    .then(res => res.json())
    .then(data => {
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
const fetchAllContacts = (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
):Promise<BridalLiveContact[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch Contact list data without a valid token')
  }

  return fetch(BL_ROOT_URL + CONTACTS_ENDPOINTS.allContacts, {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
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
const deleteContact = (
  token: BridalLiveToken,
  contactId: string | number
): Promise<BridalLiveContact> => {
  if (!token || token === '') {
    logError('Cannot delete Contact data without a valid token', null, true)
    throw new Error('Cannot delete Contact data without a valid token')
  }

  return fetch(BL_ROOT_URL + `${CONTACTS_ENDPOINTS.deleteContact}/${contactId.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        throw data
      } else {
        return data
      }
    })
}

/**
 * Fetch BridalLiveCompany item for retailerId and apiKey.
 * Uses the BridalLive `company-controller`:
 *
 * @see https://app.bridallive.com/bl-server/swagger-ui.html#/company-controller
 * @param token BridalLive token used to authenticate the request
 */
const fetchBridalLiveCompany = (
  
  token: BridalLiveToken
): Promise<BridalLiveCompany> => {
  if (!token || token === '') {
    logError(
      'Cannot fetch BridalLive Company data without a valid token',
      null,
      true
    )
    throw new Error(
      'Cannot fetch BridalLive Company data without a valid token'
    )
  }
  return fetch(BL_ROOT_URL + COMPANY_ENDPOINTS.company, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data) return data
    })
    .catch(error => {
      logError(
        'Failed to fetch BridalLive Company data',
        error,
        true
      )
      throw new Error('Failed to fetch BridalLive Company data')
    })
  // return
  // fetch(BL_ROOT_URL + COMPANY_ENDPOINTS.company, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     token: token
  //   }
  // })
  //   .then(res => res.json())
  //   .then((data: BridalLiveCompany) => {
  //     console.log('data', data)
  //     return data
  //   })
  //   .catch(error => {
  //     console.log('failed to fetch company')
  //     logError(
  //       'Failed to fetch BridalLive Company data',
  //       'fetchBridalLiveCompany',
  //       error
  //     )
  //     throw new Error('Failed to fetch BridalLive Company data')
  //   })
}

export default {
  MONTH_LABEL_FORMAT,
  DATE_CRITERIA_FORMAT,
  getApiCredentials,
  authenticate,
  fetchAllItems,
  fetchItem,
  deleteItem,
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
  fetchAllPayments,
  deletePayment,
  fetchAllContacts,
  deleteContact,
  fetchBridalLiveCompany
}
