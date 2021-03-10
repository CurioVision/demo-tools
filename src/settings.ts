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
export const BL_DEMO_ACCT_GOWN_DEPT_CODE = 'BG'
export const BL_DEMO_ACCT_OTHER_DEPT_ID = 15130
export const BL_DEMO_ACCT_OTHER_DEPT_CODE = 'OTHER'
export const BL_DEMO_ACCT_TAX_CODE_ID = 2105
export const BL_DEMO_ACCT_CONTACT_ID = 1057729
export const BL_DEMO_ACCT_CONTACT_NAME = 'Demo Contact'
export const BL_DEMO_ACCT_EMPLOYEE_ID = 6625
export const BL_DEMO_ACCT_EMPLOYEE_NAME = 'Matt Gabor'
export const BL_DEMO_ACCT_PAYMENT_METHOD_ID = 6369
export const BL_DEMO_ACCT_PAYMENT_METHOD_DESCRIPTION = 'Cash'

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

interface DemoToolCustomerSettings extends BridalCustomerSettings {
  vendorIdsToImport: number[]
}

export const BL_CUSTOMER_ACCTS = {
  customer1: {
    retailerName: 'Heba Adata',
    retailerId: '3f9f9462',
    apiKey: '2da9861cb6fb7f8b',
    gownDeptId: 25316,
    vendorIdsToImport: [
      40495, // Stella
      39541, // Essense of Australia
    ],
  },
  customer2: {
    retailerName: 'Emmy Gorman',
    retailerId: '5b19f2a7',
    apiKey: 'd0e652a9d161573d',
    gownDeptId: 793,
    vendorIdsToImport: [
      190, // Casablanca
      191, // Justin Alexander
      88573, // Colby John
    ],
  },
}

export const CUSTOMER_DATA_DIR = './data'

export const CUSTOMER_DATA_FILES = {
  vendors: `${CUSTOMER_DATA_DIR}/vendors.json`,
  items: `${CUSTOMER_DATA_DIR}/items.json`,
  itemImages: `${CUSTOMER_DATA_DIR}/itemImages.json`,
  attributes: `${CUSTOMER_DATA_DIR}/attributes.json`,
  purchaseOrders: `${CUSTOMER_DATA_DIR}/purchaseOrders.json`,
  purchaseOrderItems: `${CUSTOMER_DATA_DIR}/purchaseOrderItems.json`,
  receivingVouchers: `${CUSTOMER_DATA_DIR}/receivingVouchers.json`,
  receivingVoucherItems: `${CUSTOMER_DATA_DIR}/receivingVoucherItems.json`,
  posTransactions: `${CUSTOMER_DATA_DIR}/posTransactions.json`,
  posTransactionItems: `${CUSTOMER_DATA_DIR}/posTransactionItems.json`,
  payments: `${CUSTOMER_DATA_DIR}/payments.json`,
}
