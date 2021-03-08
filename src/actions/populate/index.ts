import fs from 'fs'
import pluralize from 'pluralize'
import BridalLiveAPI, {
  CreateFunction,
} from '../../integrations/BridalLive/api'
import { BridalLiveToken } from '../../integrations/BridalLive/apiTypes'
import { logError, logHeader, logInfo, logSuccess } from '../../logger'
import {
  BL_DEMO_ACCT_GOWN_DEPT_ID,
  BL_QA_ROOT_URL,
  CUSTOMER_DATA_FILES,
} from '../../settings'
import { BridalLiveDemoData } from '../../types'
import obfuscateGown from './obfuscate/gown'
import obfuscateItemAttribute from './obfuscate/itemAttribute'
import obfuscateItemImage from './obfuscate/itemImage'
import obfuscateVendor from './obfuscate/vendor'

type ObfuscateFunction =
  | typeof obfuscateGown
  | typeof obfuscateVendor
  | typeof obfuscateItemImage
  | typeof obfuscateItemAttribute

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
  let demoData: BridalLiveDemoData = {
    gowns: {},
    vendors: {},
    itemImages: {},
    attributes: {},
  }
  // import vendors
  demoData = await importData(
    demoAccountToken,
    demoData,
    'vendors',
    CUSTOMER_DATA_FILES.vendors,
    obfuscateVendor,
    BridalLiveAPI.createVendor
  )
  // import gowns
  demoData = await importData(
    demoAccountToken,
    demoData,
    'gowns',
    CUSTOMER_DATA_FILES.gowns,
    obfuscateGown,
    BridalLiveAPI.createItem
  )
  // import item images
  demoData = await importData(
    demoAccountToken,
    demoData,
    'itemImages',
    CUSTOMER_DATA_FILES.itemImages,
    obfuscateItemImage,
    BridalLiveAPI.createItemImage
  )
  // import item attributes
  demoData = await importData(
    demoAccountToken,
    demoData,
    'attributes',
    CUSTOMER_DATA_FILES.attributes,
    obfuscateItemAttribute,
    BridalLiveAPI.createAttribute
  )
}

const importData = async (
  demoAccountToken: BridalLiveToken,
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  dataFilename: string,
  obfuscateFn: ObfuscateFunction,
  createFn: CreateFunction
) => {
  const mappedCustomerData = await _readCustomerDataFile(dataFilename)
  const originalIds = Object.keys(mappedCustomerData)
  logInfo(`Importing ${originalIds.length} ${type}`)

  let slicedIds = type === 'gowns' ? originalIds.slice(0, 10) : originalIds
  for (const id of slicedIds) {
    let data = mappedCustomerData[id]
    logInfo(
      `Preparing to import ${pluralize.singular(type)} : ${
        data.hasOwnProperty('name') && data.name ? data.name : data.id
      }`
    )

    data = obfuscateFn(demoData, data)
    if (data) {
      try {
        const createdData = await createFn(
          BL_QA_ROOT_URL,
          demoAccountToken,
          data
        )
        if (createdData) {
          logSuccess(
            `...created ${pluralize.singular(type)}: \n\tID = ${
              createdData.id
            }, \n\tNAME = ${
              createdData.hasOwnProperty('name')
                ? createdData['name']
                : 'Data type has no name'
            }`
          )
          const data = {
            newId: createdData.id,
            cleanData: createdData,
          }
          demoData[type][id] = data
        }
      } catch (error) {
        logError('Error while creating demo date', error)
      }
    } else {
      logInfo(`...skipped import of ${pluralize.singular(type)}`)
    }
  }
  return demoData
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
