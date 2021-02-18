import boxen from 'boxen'
import BridalLiveApi from './integrations/BridalLive/api'
import { logError, logHeader, logInfo } from './logger'
import { BL_DEMO_ACCT_API_KEY, BL_DEMO_ACCT_RETAILER_ID } from './settings'

const title =
    '\n' +
    ' _                      _           \n' +
    '|~) _. _| _ || .   _   |~\\ _  _ _  _\n' +
    '|_)| |(_|(_|||_|\\/(/_  |_/(/_| | |(_)\n';

export function cleanDemoAccount() {
    const msg = `Retailer ID: ${BL_DEMO_ACCT_RETAILER_ID}\nAPI Key: ${BL_DEMO_ACCT_API_KEY}`;
    const header = `${title} ${boxen(msg, {
        padding: 1,
        margin: 1,
        borderStyle: 'round'
    })}`;
    console.log(header);

    rollbackBridalLiveDemoAccount();
}

const fetchAllAndDelete = async (
    itemType,
    token,
    fetchAllFn,
    deleteFn,
    fetchAllFilter = {}
) => {
    // fetch and delete items
    logInfo(`Fetching all ${itemType}s`);
    const items: any[] = await fetchAllFn(token, fetchAllFilter);
    if (items && items.length > 0) {
        logInfo(`\tFound ${items.length} ${itemType}s that need to be deleted`);
    } else {
        logInfo(`\tNo ${itemType}s need to be deleted`);
    }
    items.forEach(async item => {
        try {
            logInfo(`\tDeleting ${itemType} with id: ${item.id}`);
            await deleteFn(token, item.id);
        } catch (error) {
            logError(`Error while deleting ${itemType}`, error, false);
        }
    });
};

const rollbackBridalLiveDemoAccount = async () => {
    logHeader(`Rolling back BridalLive Demo account`);
    try {
        logInfo(`Authenticating BridalLive Demo account`);
        const token = await BridalLiveApi.authenticate(BL_DEMO_ACCT_RETAILER_ID, BL_DEMO_ACCT_API_KEY);
        
        const company = await BridalLiveApi.fetchBridalLiveCompany(token)
        console.log(company)

        // fetch and delete purchase orders
        await fetchAllAndDelete(
            'purchaseOrder',
            token,
            BridalLiveApi.fetchAllPurchaseOrders,
            BridalLiveApi.deletePurchaseOrder
        );
        // fetch and delete receiving orders
        await fetchAllAndDelete(
            'receivingVoucher',
            token,
            BridalLiveApi.fetchAllReceivingVouchers,
            BridalLiveApi.deleteReceivingVoucher,
            { status: '' }
        );
        // fetch and delete payments
        await fetchAllAndDelete(
            'payment',
            token,
            BridalLiveApi.fetchAllPayments,
            BridalLiveApi.deletePayment
        );
        // fetch and delete pos transactions
        await fetchAllAndDelete(
            'posTransaction',
            token,
            BridalLiveApi.fetchAllPosTransactions,
            BridalLiveApi.deletePosTransaction
        );
        // fetch and delete items
        await fetchAllAndDelete(
            'item',
            token,
            BridalLiveApi.fetchAllItems,
            BridalLiveApi.deleteItem
        );
        // fetch and delete contacts
        await fetchAllAndDelete(
            'contact',
            token,
            BridalLiveApi.fetchAllContacts,
            BridalLiveApi.deleteContact
        );
    } catch (error) {
        logError(
            'Error occurred while rolling back BridalLive demo account',
            error,
            true
        );
    }
};
