import moment from 'moment'
import { logDebug } from '../../../logger'
import { BL_CUSTOMER_ACCTS, VALID_CUSTOMERS } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
/**
 * Returns a date string that is properly formatted for using in
 * BridalLive API requests (e.g. 2019-01-01)
 * @param date
 */
const bridalLiveDateString = (date: Date | null) => {
  if (!date) return null

  var dd = date.getDate()

  var mm = date.getMonth() + 1
  var yyyy = date.getFullYear()
  let dayStr = dd.toString()
  let monthStr = mm.toString()
  let yearStr = yyyy.toString()
  if (dd < 10) {
    dayStr = '0' + dd.toString()
  }

  if (mm < 10) {
    monthStr = '0' + mm.toString()
  }

  return `${yearStr}-${monthStr}-${dayStr}`
}

export const obfuscateDate = (date: Date) => {
  // in order to make sure we don't create dates in the future and recent dates
  // stay relatively recent for effective analysis, we
  const diffDays = moment(new Date()).diff(moment(date), 'days')
  const maxOffset = diffDays > 45 ? 45 : diffDays
  const offsetDays = getRandomInt(1, maxOffset)
  const offsetSeconds = getRandomInt(1, 14400)
  // randomly add or subtract the number of offset days
  const offsetDate =
    Math.random() < 0.5
      ? moment(date)
          .add(offsetDays, 'days')
          .add(offsetSeconds, 'seconds')
          .toDate()
      : moment(date)
          .subtract(offsetDays, 'days')
          .subtract(offsetSeconds, 'seconds')
          .toDate()
  logDebug(`original date = ${date.toISOString()}`)
  logDebug(`offset date = ${offsetDate.toISOString()}`)
  return offsetDate
}

export const obfuscateDateAsBridalLiveString = (dateStr: string | null) => {
  if (!dateStr) return null

  return bridalLiveDateString(obfuscateDate(new Date(dateStr)))
}

export const obfuscateBaseBridalLiveData = (data: any) => {
  // obfuscate strings
  if (data.hasOwnProperty('createdByUser')) data.createdByUser = 'BridalVision'
  if (data.hasOwnProperty('modifiedByUser'))
    data.modifiedByUser = 'BridalVision'
  if (data.hasOwnProperty('notes')) data.notes = ''
  if (data.hasOwnProperty('description')) data.description = ''

  // obfuscate dates
  if (data.hasOwnProperty('createdDate'))
    data.createdDate = obfuscateDate(new Date(data.createdDate)).getTime()
  if (data.hasOwnProperty('modifiedDate'))
    data.modifiedDate = obfuscateDate(new Date(data.modifiedDate)).getTime()

  return data
}

export const isCustomerGownDepartmentId = (deptId: number) => {
  const idx = Object.values(BL_CUSTOMER_ACCTS).findIndex(
    (acct) => acct.gownDeptId === deptId
  )
  return idx >= 0
}

export const shouldImportCustomerVendor = (
  customer: VALID_CUSTOMERS,
  vendorToImport: number | 'all',
  vendorId: string
) => {
  if (vendorToImport !== 'all' && vendorToImport.toString() !== vendorId) {
    return false
  }

  return BL_CUSTOMER_ACCTS[customer].vendorIdsToImport.includes(
    parseInt(vendorId)
  )
}

export const dataWasAddedToDemo = (
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  itemId: string | number
) => demoData[type].hasOwnProperty(itemId) && demoData[type][itemId].newId

export const dataIdInDemo = (
  demoData: BridalLiveDemoData,
  type: keyof BridalLiveDemoData,
  customerItemId: string | number
) => demoData[type][customerItemId].newId
