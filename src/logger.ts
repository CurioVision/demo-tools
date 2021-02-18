import boxen from 'boxen'
import chalk from 'chalk'
import { GLOBAL_DEBUG_KEY } from './settings'

const header = chalk.bold.white
const info = chalk.white
const error = chalk.bold.red
const errorDetails = chalk.red
const warning = chalk.keyword('orange')

export const logHeader = (message: string) => {
  console.log(header(message))
}

export const logInfo = (message: string | object) => {
  if (typeof message === 'string') console.log(info(message))
  else console.log(info(JSON.stringify(message)))
}

export const logError = (message: string, errorObject: object | null) => {
  console.log(error(message))
  if (errorObject) {
    console.log(errorDetails(JSON.stringify(errorObject)))
  }
  if (global[GLOBAL_DEBUG_KEY]) {
    console.trace()
  }
}

export const logSevereError = (message: string, errorObject: object | null) => {
  console.log(
    `${boxen(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\nSTOP\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      {
        padding: 1,
        margin: 0,
        borderStyle: 'double',
        backgroundColor: 'red',
        borderColor: 'red',
        color: 'white',
        align: 'center',
      }
    )}`
  )
  console.log(error(message))
  if (errorObject) {
    console.log(errorDetails(JSON.stringify(errorObject)))
  }
  if (global[GLOBAL_DEBUG_KEY]) {
    console.trace()
  }
  process.kill(process.pid)
}
