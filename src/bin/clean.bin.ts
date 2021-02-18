#!/usr/bin/env node
import commander from 'commander'
import * as packgeJSON from '../../package.json'
import { cleanDemoAccount } from '../main'


const clean = () => {
    const fileName = commander.write;
    cleanDemoAccount();
    // if (fileName) {
    //     writeFile(fileName, { food, drink });
    // }
}


commander
    .version(packgeJSON.version)
    .option(
        '-w --write <string>',
        'Specifies the path of the file the order will be written to'
    )
    .action(clean)
    .parse(process.argv)
