#!/usr/bin/env node
import commander from 'commander'
import * as packgeJSON from '../../package.json'
import showJosh from '../actions/josh'
import { cleanDemoAccount, fetch, populateDemoAccount } from '../main'
import {
  CUSTOMER_DATA_DIR,
  GLOBAL_DEBUG_KEY,
  GLOBAL_IS_CUSTOMER_ACTION_KEY,
} from '../settings'

// make sure  GLOBAL_IS_CUSTOMER_ACTION_KEY defaults to false
global[GLOBAL_IS_CUSTOMER_ACTION_KEY] = false

const program = new commander.Command()

const setGlobalDebug = (debug) => {
  global[GLOBAL_DEBUG_KEY] = debug === true
}

program
  .version(packgeJSON.version)
  .option('-d --debug', 'Output additional debugging info')
  .option(
    '-w --write <string>',
    'Specifies the path of the file the order will be written to'
  )

program
  .command('all')
  .description(
    'Runs all commands that update the demo BridalLive account (QA) in the proper order. NOTE: The "fetch" command is not run; it must be explicitly executed as a safety measure, since it connects to the PROD BridalLive environment.'
  )
  .action(async ({ parent }) => {
    setGlobalDebug(parent.debug)
    await cleanDemoAccount()
    await populateDemoAccount()
  })
program
  .command('clean')
  .description(
    'Cleans up the demo BridalLive account (QA) by removing all exisiting data'
  )
  .action(({ parent }) => {
    setGlobalDebug(parent.debug)
    cleanDemoAccount()
  })
program
  .command('populate')
  .description(
    `Populates the demo BridalLive account (QA) using customer data json files in ${CUSTOMER_DATA_DIR}`
  )
  .action(({ parent }) => {
    setGlobalDebug(parent.debug)
    populateDemoAccount()
  })
program
  .command('josh')
  .description(
    'Demonstrates security bug that allowed Heba data to be mutated.'
  )
  .action(({ parent }) => {
    setGlobalDebug(parent.debug)
    showJosh()
  })

program
  .command('fetch')
  .description(
    'Fetches customer data from BridalLive (PROD) and writes it to JSON files. NOTE: All interactions with customer BridalLive accounts are READ-ONLY. No data will be updated in their accounts.'
  )
  .action(({ parent }) => {
    // Set this as a customer action so non-mutating API calls are allowed
    // against the PROD BridalLive environment
    // NO OTHER COMMANDS SHOULD RUN AS CUSTOMER ACTIONS
    global[GLOBAL_IS_CUSTOMER_ACTION_KEY] = true

    setGlobalDebug(parent.debug)
    fetch()
  })

program.parse(process.argv)
