import moment from 'moment'
import { logDebug } from '../../logger'

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

const obfuscateDate = (date: Date) => {
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

export const cleanBaseBridalLiveData = (data: any) => {
  // obfuscate strings
  if (data.hasOwnProperty('createdByUser')) data.createdByUser = 'BridalVision'
  if (data.hasOwnProperty('modifiedByUser'))
    data.modifiedByUser = 'BridalVision'
  if (data.hasOwnProperty('notes')) data.notes = ''
  if (data.hasOwnProperty('description')) data.description = ''

  // obfuscate dates
  if (data.hasOwnProperty('createdDate'))
    data.createdDate = obfuscateDate(new Date(data.createdDate)).getTime()
  if (data.hasOwnProperty('createdDate'))
    data.modifiedDate = obfuscateDate(new Date(data.modifiedDate)).getTime()

  return data
}
