import fs from 'fs'
import fetch from 'node-fetch'
import {
  BridalLiveItem,
  BridalLiveToken,
  BridalLiveVendor,
  ItemListCriteria,
} from '../integrations/BridalLive/apiTypes'
import { logError, logInfo, logSuccess } from '../logger'
import { BL_QA_ROOT_URL } from '../settings'

const FILENAME = './bug-vendor.json'

const showJosh = async () => {
  // await fetchMattData()
  await createJayData()
}

const fetchMattData = async () => {
  try {
    // login as QA user - Matt
    const MATT_RETAILER_ID = '7f4e8b14'
    const MATT_API_KEY = 'eeb92d140e9132f4'
    const mattToken = await authenticate(MATT_RETAILER_ID, MATT_API_KEY)
    if (mattToken) {
      logSuccess('Logged in as Matt in QA')
      const vendors = await fetchAllVendors(mattToken, {})
      if (vendors) {
        const vendor: BridalLiveVendor = vendors[0]
        logInfo(`Setting vendor to update: ${vendor.name}, ${vendor.id} `)
        _writeDataFile(FILENAME, vendor)
      }
    }
  } catch (error) {
    logError('Error while updating Matt account', error)
  }
}

const createJayData = async () => {
  // login as QA user - Jay
  const JAY_RETAILER_ID = 'b1375a79'
  const JAY_API_KEY = '8f3023e5d81ea4a4'
  const vendor = await _readCustomerDataFile(FILENAME)
  if (vendor) {
    try {
      const jayToken = await authenticate(JAY_RETAILER_ID, JAY_API_KEY)

      if (jayToken) {
        logSuccess('Logged in as Jay in QA')

        // POST a vendor with an ID that exists in another QA account
        // This updates the retailer ID in the item, which removes it from the
        // original account and adds it to the current authenticated account
        logInfo(`Creating vendor: ${vendor.name}, ${vendor.id} `)
        const updatedVendor = await createVendor(jayToken, vendor)

        console.log(updatedVendor)

        // DELETE the item
      }
    } catch (error) {
      logError('Error while updating Jay account', error)
    }
  }
}

const authenticate = async (retailerId: string, apiKey: string) => {
  if (!retailerId || !apiKey || retailerId === '' || apiKey === '') {
    throw new Error('Missing retailer ID or API key')
  }
  return fetch(BL_QA_ROOT_URL + '/bl-server/api/auth/apiLogin', {
    method: 'POST',
    body: JSON.stringify({
      retailerId: retailerId,
      apiKey: apiKey,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      console.log(res)
      return res.json()
    })
    .then((data) => {
      if (data.hasOwnProperty('token')) {
        return data.token
      } else {
        throw data
      }
    })
    .catch((error) => {
      throw error
    })
}

const createItem = async (
  token: BridalLiveToken,
  item: BridalLiveItem
): Promise<BridalLiveItem> => {
  if (!token || token === '') {
    logError('Cannot create an Item data without a valid token', null)
    throw new Error('Cannot create an Item without a valid token')
  }

  return fetch(BL_QA_ROOT_URL + '/bl-server/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to create Item data', error)
      throw new Error('Failed to create Item data')
    })
}

const createVendor = async (
  token: BridalLiveToken,
  vendor: BridalLiveVendor
): Promise<BridalLiveVendor> => {
  if (!token || token === '') {
    logError('Cannot create an Vendor data without a valid token', null)
    throw new Error('Cannot create an Vendor without a valid token')
  }

  return fetch(BL_QA_ROOT_URL + '/bl-server/api/vendors', {
    method: 'POST',
    body: JSON.stringify(vendor),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((error) => {
      logError('Failed to create Vendor data', error)
      throw new Error('Failed to create Vendor data')
    })
}

const fetchAllVendors = async (
  token: BridalLiveToken,
  filterCriteria: ItemListCriteria
): Promise<BridalLiveVendor[]> => {
  if (!token || token === '') {
    throw new Error('Cannot fetch Vendor list data without a valid token')
  }

  return fetch(BL_QA_ROOT_URL + '/bl-server/api/vendors/list?page=0', {
    method: 'POST',
    body: JSON.stringify(filterCriteria),
    headers: {
      'Content-Type': 'application/json',
      token: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result) return data.result as BridalLiveVendor[]
    })
    .catch(() => {
      throw new Error('Failed to fetch Purchase Order list data')
    })
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

const _readCustomerDataFile = async (filename: string) => {
  try {
    logInfo(`Reading customer data: ${filename}`)
    let rawData = fs.readFileSync(filename)
    return JSON.parse(rawData.toString())
  } catch (error) {
    logError('Failed to read customer data file.', error)
  }
}

export default showJosh
