import BridalLiveApi from '../integrations/BridalLive/api'
import { BridalLiveToken } from '../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo } from '../logger'

const cleanBridalLiveDemoAccount = async (token: BridalLiveToken) => {
  logHeader(`Rolling back BridalLive Demo account`)
  try {
    // fetch and delete purchase orders
    await fetchAllAndDelete(
      'purchaseOrder',
      token,
      BridalLiveApi.fetchAllPurchaseOrders,
      BridalLiveApi.deletePurchaseOrder
    )
    // fetch and delete receiving orders
    await fetchAllAndDelete(
      'receivingVoucher',
      token,
      BridalLiveApi.fetchAllReceivingVouchers,
      BridalLiveApi.deleteReceivingVoucher,
      { status: '' }
    )
    // fetch and delete payments
    await fetchAllAndDelete(
      'payment',
      token,
      BridalLiveApi.fetchAllPayments,
      BridalLiveApi.deletePayment
    )
    // fetch and delete pos transactions
    await fetchAllAndDelete(
      'posTransaction',
      token,
      BridalLiveApi.fetchAllPosTransactions,
      BridalLiveApi.deletePosTransaction
    )
    // fetch and delete items
    await fetchAllAndDelete(
      'item',
      token,
      BridalLiveApi.fetchAllItems,
      BridalLiveApi.deleteItem
    )
    // fetch and delete contacts
    await fetchAllAndDelete(
      'contact',
      token,
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
  const items: any[] = await fetchAllFn(token, fetchAllFilter)
  if (items && items.length > 0) {
    logInfo(`\tFound ${items.length} ${itemType}s that need to be deleted`)
  } else {
    logInfo(`\tNo ${itemType}s need to be deleted`)
  }
  items.forEach(async (item) => {
    try {
      logInfo(`\tDeleting ${itemType} with id: ${item.id}`)
      await deleteFn(token, item.id)
    } catch (error) {
      logError(`Error while deleting ${itemType}`, error)
    }
  })
}

export default cleanBridalLiveDemoAccount
