import boxen from 'boxen'
import chalk from 'chalk'
import fs from 'fs'
import { GLOBAL_DEBUG_KEY } from './settings'

const header = chalk.bold.white
const info = chalk.white
const success = chalk.green
const error = chalk.bold.red
const errorDetails = chalk.red
const warning = chalk.keyword('orange')

const consoleOutputFile = new console.Console(
  fs.createWriteStream('./output.txt')
)
const log = (message: string, debugMessage: boolean = false) => {
  // if it's not a debug message write to both loggers
  if (!debugMessage) {
    console.log(message)
    consoleOutputFile.log(message)
  } else {
    // since it's a debug message, only output to console if the debug flag
    // was enabled. note: debug messages always get written th output.txt
    if (global[GLOBAL_DEBUG_KEY]) console.log(message)

    consoleOutputFile.log(message)
  }
}

export const logHeader = (message: string) => {
  log('\n')
  log(header(message))
}

export const logInfo = (message: string | object) => {
  if (typeof message === 'string') log(info(message))
  else log(info(JSON.stringify(message)))
}

export const logSuccess = (message: string | object) => {
  if (typeof message === 'string') log(success(message))
  else log(success(JSON.stringify(message)))
}

export const logError = (message: string, errorObject: object | null) => {
  log(error(message))
  if (errorObject) {
    log(errorDetails(JSON.stringify(errorObject)))
  }
  if (global[GLOBAL_DEBUG_KEY]) {
    console.trace()
  }
}

export const logDebug = (message: string) => {
  if (typeof message === 'string') log(info(message), true)
  else log(info(JSON.stringify(message)), true)
}

export const logSevereError = (message: string, errorObject: object | null) => {
  log(
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
  log(error(message))
  if (errorObject) {
    log(errorDetails(JSON.stringify(errorObject)))
  }
  if (global[GLOBAL_DEBUG_KEY]) {
    console.trace()
  }
  process.kill(process.pid)
}
