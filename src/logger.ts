import chalk from 'chalk'

const header = chalk.bold.white
const info = chalk.white
const error = chalk.bold.red
const errorDetails = chalk.red
const warning = chalk.keyword('orange')

export const logHeader = (
  message: string,
) => {
  console.log(header(message))
}

export const logInfo = (
  message: string | object,
) => {
  if(typeof message === 'string') console.log(info(message))
  else console.log(info(JSON.stringify(message)))
}

export const logError = (
  message: string,
  errorObject: object | null,
  printStack: boolean
) => {
  console.log(error(message))
  if(errorObject) {
    console.log(errorDetails(JSON.stringify(errorObject)))
  }
  if(printStack) {
    console.trace()
  }
}