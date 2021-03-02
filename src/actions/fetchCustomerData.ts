import boxen from 'boxen'
import chalk from 'chalk'
import ObjectsToCsv from 'objects-to-csv'
import BridalLiveAPI, { FetchAllFunction } from '../integrations/BridalLive/api'
import {
  BaseBridalLiveObject,
  BridalCustomerSettings,
  BridalLiveContact,
  BridalLiveItem,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrder,
  BridalLiveReceivingVoucher,
  BridalLiveToken,
  BridalLiveVendor,
} from '../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../logger'
import { BL_CUSTOMER_ACCTS, BL_PROD_ROOT_URL } from '../settings'
interface BridalLiveCustomerData {
  items: { [id: number]: BridalLiveItem }
  contacts: { [id: number]: BridalLiveContact }
  purchaseOrders: { [id: number]: BridalLivePurchaseOrder }
  receivingVouchers: { [id: number]: BridalLiveReceivingVoucher }
  posTransactions: { [id: number]: BridalLivePosTransaction }
  posTransactionItems: { [id: number]: BridalLivePosTransactionLineItem }
  vendors: { [id: number]: BridalLiveVendor }
  payments: { [id: number]: BridalLivePayment }
}

type TrackedBridalLiveTypes =
  | BridalLiveItem
  | BridalLiveContact
  | BridalLivePurchaseOrder
  | BridalLiveReceivingVoucher
  | BridalLivePosTransaction
  | BridalLivePosTransactionLineItem
  | BridalLiveVendor
  | BridalLivePayment
interface DemoData<T> {
  newId: number
  cleanData: T
}

interface DemoItemData extends DemoData<BridalLiveItem> {}
interface DemoVendorData extends DemoData<BridalLiveVendor> {}
interface BridalLiveDemoData {
  items: { [id: number]: DemoItemData }
  vendors: { [id: number]: DemoVendorData }
}

const fetchCustomerData = async () => {
  try {
    const customerToken = await authenticateCustomerAccount(
      BL_CUSTOMER_ACCTS[0]
    )
    if (customerToken) {
      const customerData = await fetchAllDataFromCustomer(customerToken)
      const file = './HebaItems.csv'
      logInfo(`Writing CSV: ${file}`)
      const csv = new ObjectsToCsv(Object.values(customerData.items))
      await csv.toDisk(file)
      logSuccess('Wrote csv file')
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

const fetchAllDataFromCustomer = async (customerToken: BridalLiveToken) => {
  logHeader('Fetching all customer data')
  // fetch items
  const items = await fetchAndMapData(
    'item',
    customerToken,
    BridalLiveAPI.fetchAllItems,
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
    items: items,
    contacts: contacts,
    purchaseOrders: purchaseOrders,
    receivingVouchers: receivingVouchers,
    posTransactions: posTransactions,
    posTransactionItems: posTransactionItems,
    vendors: vendors,
    payments: payments,
  }
  return customerData
}

const fetchAndMapData = async (
  itemType: string,
  customerToken: BridalLiveToken,
  fetchAllFn: FetchAllFunction,
  fetchAllFilter: any
) => {
  logInfo(`Fetching all customer ${itemType}s`)
  const items: BaseBridalLiveObject[] = await fetchAllFn(
    BL_PROD_ROOT_URL,
    customerToken,
    fetchAllFilter
  )
  let mapped = {}
  if (items && items.length > 0) {
    logInfo(`...found ${items.length} ${itemType}s`)
    items.reduce((_mapped, item) => {
      _mapped[item.id] = item
      return _mapped
    }, mapped)
  } else {
    logInfo(`...no ${itemType}s found`)
  }
  return mapped
}

export default fetchCustomerData
