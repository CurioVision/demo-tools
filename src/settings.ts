export const BL_PROD_ROOT_URL = 'https://app.bridallive.com'
export const BL_QA_ROOT_URL = 'https://qa.bridallive.com'

/**
 * DO NOT CHANGE THE BL_DEMO_ACCT VALUES UNLESS YOU KNOW WHAT YOU ARE DOING!!!
 * Data gets deleted and updated in the BL_DEMO_ACCT. The retailer id and api
 * key below are associated with Matt Gabor's QA BridalLive account (credentials
 * are stored in 1Password).
 */
export interface DemoAccountSettings {
  retailerId: string
  apiKey: string //eeb92d140e9132f4',
  gownDeptId: number //5109,
  gownDeptCode: string //BG',
  otherDeptId: number //5130,
  otherDeptCode: string //OTHER',
  taxCodeId: number //105,
  contactId: number //057729,
  contactName: string //Demo Contact',
  employeeId: number //625,
  employeeName: string //Matt Gabor',
  paymentMethodId: number //369,
  paymentMethodDescription: string //Cash',
  accountValidation: {
    companyName: string //BridalVision Demo Store',
    emailAddress: string //matt@curiovision.business',
  }
}
export const BL_DEMO_ACCTS: { [demoKey: string]: DemoAccountSettings } = {
  // Matt Gabor demo account in BridalLive QA
  demo1: {
    retailerId: '7f4e8b14',
    apiKey: 'eeb92d140e9132f4',
    gownDeptId: 15109,
    gownDeptCode: 'BG',
    otherDeptId: 15130,
    otherDeptCode: 'OTHER',
    taxCodeId: 2105,
    contactId: 1057729,
    contactName: 'Demo Contact',
    employeeId: 6625,
    employeeName: 'Demo Employee',
    paymentMethodId: 6369,
    paymentMethodDescription: 'Cash',
    accountValidation: {
      companyName: 'BridalVision Demo Store',
      emailAddress: 'matt@curiovision.business',
    },
  },
  // Jay Tavares demo account in BridalLive QA
  demo2: {
    retailerId: 'b1375a79',
    apiKey: '8f3023e5d81ea4a4',
    gownDeptId: 15375,
    gownDeptCode: 'BG',
    otherDeptId: 15376,
    otherDeptCode: 'OTHER',
    taxCodeId: 2113,
    contactId: 1057740,
    contactName: 'Demo Customer',
    employeeId: 6650,
    employeeName: 'Jay Tavares',
    paymentMethodId: 6471,
    paymentMethodDescription: 'Cash',
    accountValidation: {
      companyName: 'BridalVision Demo 2 Store',
      emailAddress: 'jay@curiovision.com',
    },
  },
  // Ingrid Heilke demo account in BridalLive QA
  demo3: {
    retailerId: '05716f6b',
    apiKey: 'a6623ec6bcf46094',
    gownDeptId: 16681,
    gownDeptCode: 'BG',
    otherDeptId: 16696,
    otherDeptCode: 'OTHER',
    taxCodeId: 2117,
    contactId: 1057763,
    contactName: 'Demo Customer',
    employeeId: 6750,
    employeeName: 'Ingrid Heilke',
    paymentMethodId: 6995,
    paymentMethodDescription: 'Cash',
    accountValidation: {
      companyName: "Ingrid's Bridal Store",
      emailAddress: 'ingrid@curiovision.business',
    },
  },
}
export type VALID_DEMO_ACCOUNTS = keyof DemoAccountSettings

// export const BL_DEMO_ACCT_RETAILER_ID = '7f4e8b14'
// export const BL_DEMO_ACCT_API_KEY = 'eeb92d140e9132f4'
// export const BL_DEMO_ACCT_GOWN_DEPT_ID = 15109
// export const BL_DEMO_ACCT_GOWN_DEPT_CODE = 'BG'
// export const BL_DEMO_ACCT_OTHER_DEPT_ID = 15130
// export const BL_DEMO_ACCT_OTHER_DEPT_CODE = 'OTHER'
// export const BL_DEMO_ACCT_TAX_CODE_ID = 2105
// export const BL_DEMO_ACCT_CONTACT_ID = 1057729
// export const BL_DEMO_ACCT_CONTACT_NAME = 'Demo Contact'
// export const BL_DEMO_ACCT_EMPLOYEE_ID = 6625
// export const BL_DEMO_ACCT_EMPLOYEE_NAME = 'Matt Gabor'
// export const BL_DEMO_ACCT_PAYMENT_METHOD_ID = 6369
// export const BL_DEMO_ACCT_PAYMENT_METHOD_DESCRIPTION = 'Cash'

/**
 * The following values are checked prior to ANY BridalLive API calls that
 * mutate data. This is a protective measure to ensure that we never mutate
 * data in any customer BridalLive accounts.
 */

// export const BL_DEMO_ACCT_VALIDATION = {
//   companyName: 'BridalVision Demo Store',
//   emailAddress: 'matt@curiovision.business',
// }

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

export const BL_CUSTOMER_ACCTS = {
  customer1: {
    retailerName: 'Heba Adata',
    retailerId: '3f9f9462',
    apiKey: '2da9861cb6fb7f8b',
    gownDeptId: 25316,
    vendorIdsToImport: [
      40495, // Stella
      39541, // Essense of Australia
      42335, // Eddy K
      39736, // Blush by Hayley Paige
      40050, // Kelly Faetanini
      63215, // Tara Lauren
      39680, // W-TOO
      62005, // Allure Romance
      50739, // Christos
      72710, // Nicole Spose
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
      110209, // Rings
      6652, // Robert Bullock Bride
      88572, // Lotus Threads
    ],
  },
  customer3: {
    retailerName: 'Vanessa Dineen',
    retailerId: '726804d6',
    apiKey: 'b87c0ff4b4558987',
    gownDeptId: 25897,
    vendorIdsToImport: [
      36905, // Anna Campbell
      55738, // Leanne Marshall
      88119, // Studio Levana
      36915, // Theia
      36903, // Truvelle
      36908, // Carol Hannah
      66083, // Rish Bridal
      80445, // Tara La Tour
      104454, // White One
      83315, // Aesling
    ],
  },
}

export type VALID_CUSTOMERS = keyof typeof BL_CUSTOMER_ACCTS
export const CUSTOMER_DATA_DIR = './data'

export const CUSTOMER_DATA_FILES = {
  vendors: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/vendors.json`,
  items: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/items.json`,
  itemImages: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/itemImages.json`,
  attributes: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/attributes.json`,
  purchaseOrders: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/purchaseOrders.json`,
  purchaseOrderItems: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/purchaseOrderItems.json`,
  receivingVouchers: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/receivingVouchers.json`,
  receivingVoucherItems: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/receivingVoucherItems.json`,
  posTransactions: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/posTransactions.json`,
  posTransactionItems: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/posTransactionItems.json`,
  payments: (customer: VALID_CUSTOMERS) =>
    `${CUSTOMER_DATA_DIR}/${customer}/payments.json`,
}
