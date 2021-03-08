import boxen from 'boxen'
import chalk from 'chalk'
import fs from 'fs'
import BridalLiveAPI, { FetchAllFunction } from '../integrations/BridalLive/api'
import {
  BaseBridalLiveObject,
  BridalCustomerSettings,
  BridalLiveToken,
} from '../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../logger'
import {
  BL_CUSTOMER_ACCTS,
  BL_PROD_ROOT_URL,
  CUSTOMER_DATA_FILES,
} from '../settings'
import { BridalLiveCustomerData } from '../types'

const fetchCustomerData = async () => {
  try {
    const customerToken = await authenticateCustomerAccount(
      BL_CUSTOMER_ACCTS[0]
    )
    if (customerToken) {
      const customerData = await fetchAllDataFromCustomer(
        customerToken,
        BL_CUSTOMER_ACCTS[0].gownDeptId
      )
      _writeDataFile(CUSTOMER_DATA_FILES.gowns, customerData.gowns)
      _writeDataFile(CUSTOMER_DATA_FILES.vendors, customerData.vendors)
      _writeDataFile(CUSTOMER_DATA_FILES.attributes, customerData.attributes)
      _writeDataFile(CUSTOMER_DATA_FILES.itemImages, customerData.itemImages)
      logSuccess('Wrote customer data files')
    }
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

export const authenticateCustomerAccount = async (
  customer: BridalCustomerSettings
) => {
  try {
    logHeader('Authenticating customer account')
    const customerToken = await BridalLiveAPI.authenticate(
      BL_PROD_ROOT_URL,
      customer.retailerId,
      customer.apiKey
    )

    const company = await BridalLiveAPI.fetchBridalLiveCompany(
      BL_PROD_ROOT_URL,
      customerToken
    )
    if (!company || !customerToken)
      throw new Error(
        `Failed to authenticate customer BridalLive account. Retailer ID: ${customer.retailerId}, API Key: ${customer.apiKey}`
      )

    const customerAccountMsg = `${chalk.bold(
      'BridalLive Customer Account'
    )}\nStore: ${company.name}\nEmail: ${company.emailAddress}`
    const accountBox = `${boxen(customerAccountMsg, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
    })}`
    console.log(accountBox)
    return customerToken
  } catch (error) {
    logError(
      'Error occurred while authenticating Customer BridalLive account',
      error
    )
    return undefined
  }
}

const fetchAllDataFromCustomer = async (
  customerToken: BridalLiveToken,
  gownDeptId: number
) => {
  logHeader('Fetching all customer data')
  // fetch items
  const gowns = await fetchAndMapData(
    'gown',
    customerToken,
    BridalLiveAPI.fetchAllItems,
    {
      status: '',
      departmentId: gownDeptId,
    }
  )

  // fetch attributes
  const attributes = await fetchAndMapData(
    'attribute',
    customerToken,
    BridalLiveAPI.fetchAllAttributesByItem,
    {}
  )

  // fetch images
  const itemImages = await fetchAndMapData(
    'itemImage',
    customerToken,
    BridalLiveAPI.fetchAllItemImages,
    {}
  )

  // fetch contacts
  const contacts = await fetchAndMapData(
    'contact',
    customerToken,
    BridalLiveAPI.fetchAllContacts,
    {}
  )
  // fetch purchaseOrders
  const purchaseOrders = await fetchAndMapData(
    'purchaseOrder',
    customerToken,
    BridalLiveAPI.fetchAllPurchaseOrders,
    { orderType: '', status: '' }
  )
  // fetch receivingVouchers
  const receivingVouchers = await fetchAndMapData(
    'receivingVoucher',
    customerToken,
    BridalLiveAPI.fetchAllReceivingVouchers,
    { status: '' }
  )
  // fetch posTransactions
  const posTransactions = await fetchAndMapData(
    'posTransaction',
    customerToken,
    BridalLiveAPI.fetchAllPosTransactions,
    {
      status: '',
      typeId: -1,
    }
  )
  // fetch posTransactions
  const posTransactionItems = await fetchAndMapData(
    'posTransactionItem',
    customerToken,
    BridalLiveAPI.fetchAllPosTransactionItems,
    {}
  )

  // fetch vendors
  const vendors = await fetchAndMapData(
    'vendor',
    customerToken,
    BridalLiveAPI.fetchAllVendors,
    { status: '' }
  )
  // fetch payments
  const payments = await fetchAndMapData(
    'payment',
    customerToken,
    BridalLiveAPI.fetchAllPayments,
    {}
  )
  const customerData: BridalLiveCustomerData = {
    gowns: gowns,
    contacts: contacts,
    purchaseOrders: purchaseOrders,
    receivingVouchers: receivingVouchers,
    posTransactions: posTransactions,
    posTransactionItems: posTransactionItems,
    vendors: vendors,
    payments: payments,
    attributes: attributes,
    itemImages: itemImages,
  }
  return customerData
}

/**
 * Removed `id` and `retailerId` from a BridalLive object in order to ensure that
 * a customer's data is never accidentally mutated.
 * @param data
 */
const _cleanBridalLiveData = (data: BaseBridalLiveObject) => {
  return {
    ...data,
    id: undefined,
    retailerId: undefined,
  }
}

const fetchAndMapData = async (
  itemType: string,
  customerToken: BridalLiveToken,
  fetchAllFn: FetchAllFunction,
  fetchAllFilter: any
) => {
  logInfo(`Fetching all customer ${itemType}s`)
  const allData: BaseBridalLiveObject[] = await fetchAllFn(
    BL_PROD_ROOT_URL,
    customerToken,
    fetchAllFilter
  )
  let mapped = {}
  if (allData && allData.length > 0) {
    logInfo(`...found ${allData.length} ${itemType}s`)
    allData.reduce((_mapped, data) => {
      _mapped[data.id] = _cleanBridalLiveData(data)
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

export default fetchCustomerData