import { BridalLiveApiCredentials } from './integrations/BridalLive/apiTypes'

export const BL_ROOT_URL = 'https://app.bridallive.com'

/**
 * DO NOT CHANGE THE BL_DEMO_ACCT VALUES UNLESS YOU KNOW WHAT YOU ARE DOING!!!
 * Data gets deleted and updated in the BL_DEMO_ACCT. The retailer id and api
 * key below are associated with Ingrid's BridalLive account (credentials are
 * stored in 1Password).
 */
export const BL_DEMO_ACCT_RETAILER_ID = 'fa96bd3d'
export const BL_DEMO_ACCT_API_KEY = '6d448f878611dca9'
/**
 * The following values are checked prior to ANY BridalLive API calls that
 * mutate data. This is a protective measure to ensure that we never mutate
 * data in any customer BridalLive accounts.
 */

export const BL_DEMO_ACCT_VALIDATION = {
  companyName: 'Demo Bridal Store',
  emailAddress: 'ingrid@butterflyrevolution.com',
}

/**
 * Key used to store global debug option.
 * Setting a global variable in the Commander program is a hacky way to avoid
 * passing the debug option around.
 */
export const GLOBAL_DEBUG_KEY = 'debugDemoTools'

export const BL_CUSTOMER_ACCTS: BridalLiveApiCredentials[] = [
  // Heba Adata
  { retailerId: '3f9f9462', apiKey: '2da9861cb6fb7f8b' },
]
