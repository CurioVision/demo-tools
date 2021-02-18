#!/usr/bin/env node
import commander from 'commander'
import * as packgeJSON from '../../package.json'
import { cleanDemoAccount, populateDemoAccount } from '../main'
import { GLOBAL_DEBUG_KEY } from '../settings'

const program = new commander.Command()

const clean = () => {
  const fileName = commander.write
  // if (fileName) {
  //     writeFile(fileName, { food, drink });
  // }
}

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
  .description('Runs all demo tool commands in order')
  .action(async ({ parent }) => {
    setGlobalDebug(parent.debug)
    await cleanDemoAccount()
    await populateDemoAccount()
  })
program
  .command('clean')
  .description(
    'Cleans up the demo BridalLive account by removing all exisiting data'
  )
  .action(({ parent }) => {
    setGlobalDebug(parent.debug)
    cleanDemoAccount()
  })

program
  .command('populate')
  .description(
    'Populates the demo BridalLive account by adding data from other customer BridalLive accounts. NOTE: All interactions with customer BridalLive accounts are READ-ONLY. No data will be updated in their accounts.'
  )
  .action(({ parent }) => {
    setGlobalDebug(parent.debug)
    populateDemoAccount()
  })

program.parse(process.argv)
