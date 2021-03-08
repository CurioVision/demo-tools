import { BridalCustomerSettings } from './integrations/BridalLive/apiTypes'

export const BL_PROD_ROOT_URL = 'https://app.bridallive.com'
export const BL_QA_ROOT_URL = 'https://qa.bridallive.com'

/**
 * DO NOT CHANGE THE BL_DEMO_ACCT VALUES UNLESS YOU KNOW WHAT YOU ARE DOING!!!
 * Data gets deleted and updated in the BL_DEMO_ACCT. The retailer id and api
 * key below are associated with Matt Gabor's QA BridalLive account (credentials
 * are stored in 1Password).
 */
export const BL_DEMO_ACCT_RETAILER_ID = '7f4e8b14'
export const BL_DEMO_ACCT_API_KEY = 'eeb92d140e9132f4'
export const BL_DEMO_ACCT_GOWN_DEPT_ID = 15109
export const BL_DEMO_ACCT_TAX_CODE_ID = 2105

/**
 * The following values are checked prior to ANY BridalLive API calls that
 * mutate data. This is a protective measure to ensure that we never mutate
 * data in any customer BridalLive accounts.
 */

export const BL_DEMO_ACCT_VALIDATION = {
  companyName: 'BridalVision Demo Store',
  emailAddress: 'matt@curiovision.business',
}

/**
 * Key used to store global debug option.
 * Setting a global variable in the Commander program is a hacky way to avoid
 * passing the debug option around.
 */
export const GLOBAL_DEBUG_KEY = 'demoTools_isDebug'
/**
 * Key used to store global isCustomerAction option. This is a security measure
 * to ensure that non-customer actions always run against the QA BridalLive
 * environment.
 */
export const GLOBAL_IS_CUSTOMER_ACTION_KEY = 'demoTools_isCustomerAction'

export const BL_CUSTOMER_ACCTS: BridalCustomerSettings[] = [
  {
    retailerName: 'Heba Adata',
    retailerId: '3f9f9462',
    apiKey: '2da9861cb6fb7f8b',
    gownDeptId: 25316,
  },
]

export const CUSTOMER_DATA_DIR = './data'

export const CUSTOMER_DATA_FILES = {
  vendors: `${CUSTOMER_DATA_DIR}/vendors.json`,
  gowns: `${CUSTOMER_DATA_DIR}/gowns.json`,
  itemImages: `${CUSTOMER_DATA_DIR}/itemImages.json`,
  attributes: `${CUSTOMER_DATA_DIR}/attributes.json`,
  purchaseOrders: `${CUSTOMER_DATA_DIR}/purchaseOrders.json`,
  receivingVouchers: `${CUSTOMER_DATA_DIR}/receivingVouchers.json`,
  posTransactions: `${CUSTOMER_DATA_DIR}/posTransactions.json`,
  posTransactionItems: `${CUSTOMER_DATA_DIR}/posTransactionItems.json`,
}
