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
const logToFile = (message: string | object | null) => {
  if (!message) return

  const str =
    typeof message === 'string' ? message : JSON.stringify(message, null, 2)
  consoleOutputFile.log(str)
}

export const logHeader = (message: string) => {
  logToFile(`\n${message}`)

  console.log('\n')
  console.log(header(message))
}

export const logInfo = (message: string | object) => {
  logToFile(message)

  if (typeof message === 'string') console.log(info(message))
  else console.log(info(JSON.stringify(message, null, 2)))
}

export const logSuccess = (message: string | object) => {
  logToFile(message)

  if (typeof message === 'string') console.log(success(message))
  else console.log(success(JSON.stringify(message, null, 2)))
}

export const logWarning = (message: string | object) => {
  logToFile(message)

  if (typeof message === 'string') console.log(warning(message))
  else console.log(warning(JSON.stringify(message, null, 2)))
}

export const logError = (message: string, errorObject: object | null) => {
  logToFile(message)
  logToFile(errorObject)

  console.log(error(message))
  if (errorObject) {
    console.log(errorDetails(JSON.stringify(errorObject, null, 2)))
  }
  if (global[GLOBAL_DEBUG_KEY]) {
    console.trace()
  }
}

export const logDebug = (message: string | object) => {
  logToFile(message)

  if (global[GLOBAL_DEBUG_KEY]) {
    if (typeof message === 'string') console.log(info(message), true)
    else console.log(info(JSON.stringify(message, null, 2)), true)
  }
}

export const logSevereError = (message: string, errorObject: object | null) => {
  logToFile(message)
  logToFile(errorObject)

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
