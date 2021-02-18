import BridalLiveApi from '../integrations/BridalLive/api'
import {
  BaseBridalLiveObject,
  BridalLiveToken,
} from '../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo } from '../logger'

const cleanBridalLiveDemoAccount = async (
  demoAccounttoken: BridalLiveToken
) => {
  logHeader(`Rolling back BridalLive Demo account`)
  try {
    // fetch and delete purchase orders
    await fetchAllAndDelete(
      'purchaseOrder',
      demoAccounttoken,
      BridalLiveApi.fetchAllPurchaseOrders,
      BridalLiveApi.deletePurchaseOrder
    )
    // fetch and delete receiving orders
    await fetchAllAndDelete(
      'receivingVoucher',
      demoAccounttoken,
      BridalLiveApi.fetchAllReceivingVouchers,
      BridalLiveApi.deleteReceivingVoucher,
      { status: '' }
    )
    // fetch and delete payments
    await fetchAllAndDelete(
      'payment',
      demoAccounttoken,
      BridalLiveApi.fetchAllPayments,
      BridalLiveApi.deletePayment
    )
    // fetch and delete pos transactions
    await fetchAllAndDelete(
      'posTransaction',
      demoAccounttoken,
      BridalLiveApi.fetchAllPosTransactions,
      BridalLiveApi.deletePosTransaction
    )
    // fetch and delete items
    await fetchAllAndDelete(
      'item',
      demoAccounttoken,
      BridalLiveApi.fetchAllItems,
      BridalLiveApi.deleteItem
    )
    // fetch and delete contacts
    await fetchAllAndDelete(
      'contact',
      demoAccounttoken,
      BridalLiveApi.fetchAllContacts,
      BridalLiveApi.deleteContact
    )
  } catch (error) {
    logError('Error occurred while cleaning BridalLive demo account', error)
  }
}

const fetchAllAndDelete = async (
  itemType,
  token,
  fetchAllFn,
  deleteFn,
  fetchAllFilter = {}
) => {
  // fetch and delete items
  logInfo(`Fetching all ${itemType}s`)
  const items: BaseBridalLiveObject[] = await fetchAllFn(token, fetchAllFilter)
  if (items && items.length > 0) {
    logInfo(`Found ${items.length} ${itemType}s that need to be deleted`)
  } else {
    logInfo(`\tNo ${itemType}s need to be deleted`)
  }
  for (const item of items) {
    try {
      logInfo(`\tAttempting to delete ${itemType} with id: ${item.id}`)
      await deleteFn(token, item.id)
      logInfo(`\t...deleted ${item.id}`)
    } catch (error) {
      logError(`Error while deleting ${itemType}`, error)
    }
  }
}

export default cleanBridalLiveDemoAccount
