import fs from 'fs'
import pluralize from 'pluralize'
import BridalLiveAPI, {
  CreateFunction,
} from '../../integrations/BridalLive/api'
import {
  BridalLiveItem,
  BridalLiveToken,
  BridalLiveVendor,
} from '../../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../../logger'
import {
  BL_DEMO_ACCT_GOWN_DEPT_ID,
  BL_QA_ROOT_URL,
  CUSTOMER_DATA_FILES,
} from '../../settings'
import { BridalLiveDemoData } from '../../types'
import { cleanBaseBridalLiveData } from './utils'

type CleanFunction = typeof cleanGown | typeof cleanVendor

const populateDemoAccount = async (demoAccounttoken: BridalLiveToken) => {
  logHeader(`Populating BridalLive Demo account`)
  try {
    importCustomerData(demoAccounttoken, BL_DEMO_ACCT_GOWN_DEPT_ID)
  } catch (error) {
    logError('Error occurred while populating BridalLive demo account', error)
  }
}

const importCustomerData = async (
  demoAccountToken: BridalLiveToken,
  demoGownDeptId: number
) => {
  let demoData: BridalLiveDemoData = { gowns: {}, vendors: {} }
  // import vendors
  demoData = await importData(
    demoAccountToken,
    demoData,
    'vendors',
    CUSTOMER_DATA_FILES.vendors,
    cleanVendor,
    BridalLiveAPI.createVendor
  )
  // import gowns
  demoData = await importData(
    demoAccountToken,
    demoData,
    'gowns',
    CUSTOMER_DATA_FILES.gowns,
    cleanGown,
    BridalLiveAPI.createItem
  )
  // demoData = await importVendors(demoAccountToken, demoData)
  // demoData = await importGowns(demoAccountToken, demoData)
}

const importData = async (
  demoAccountToken: BridalLiveToken,
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  dataFilename: string,
  cleanDataFn: CleanFunction,
  createFn: CreateFunction
) => {
  const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  const originalIds = Object.keys(mappedCustomerData)
  logInfo(`Importing ${originalIds.length} ${type}`)

  let slicedIds = type === 'gowns' ? originalIds.slice(0, 10) : originalIds
  for (const id of slicedIds) {
    let data = mappedCustomerData[id]
    logInfo(`Preparing to import ${pluralize.singular(type)} : ${data.name}`)

    data = cleanDataFn(demoData, data)
    const createdData = await createFn(BL_QA_ROOT_URL, demoAccountToken, data)
    if (createdData) {
      logSuccess(
        `...created ${type}: \n\tID = ${createdData.id}, \n\tNAME = ${createdData.name}`
      )
      const data = {
        newId: createdData.id,
        cleanData: createdData,
      }
      demoData[type][id] = data
    }
  }
  return demoData
}

const cleanGown = (demoData: BridalLiveDemoData, gown: BridalLiveItem) => {
  // replace any identifying values
  logInfo(`...obfuscating data`)
  gown = cleanBaseBridalLiveData(gown)

  // make sure gowns use the gown department id from our demo account
  logInfo(`...setting Gown Dept ID to ${BL_DEMO_ACCT_GOWN_DEPT_ID}`)
  gown.departmentId = BL_DEMO_ACCT_GOWN_DEPT_ID

  // set new vendor id
  gown.vendorId = demoData.vendors[gown.vendorId].newId

  // unlink from marketplace
  gown.marketplaceId = undefined

  return gown
}

const cleanVendor = (
  demoData: BridalLiveDemoData,
  vendor: BridalLiveVendor
) => {
  // replace any identifying values
  logInfo(`...obfuscating data`)
  vendor = cleanBaseBridalLiveData(vendor)
  return vendor
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

export default populateDemoAccount
