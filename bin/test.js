#!/usr/bin/env node

'use strict';

const meow = require('meow');
const ora = require('ora');
const loadConfig = require('../lib/config');
const backstop = require('backstopjs')
const {enableLogging, disableLogging} = require('../lib/logging');

module.exports = async () => {
    const cli = meow(
        `
        Usage
            $ website-diff test
        `,
        {
            flags: {
                verbose: {
                    alias: 'v',
                    type: 'boolean'
                }
            }
        }
    );

    const config = loadConfig(cli.flags);

    const start = +new Date();
    const spinner = ora('Generating test and diff bitmaps ...').start();

    config.verbose || disableLogging();
    await backstop('test', {config: config.paths.backstop_config});
    config.verbose || enableLogging();

    spinner.succeed(`Generated test bitmaps in ${(new Date() - start) / 1000}s`);
}
