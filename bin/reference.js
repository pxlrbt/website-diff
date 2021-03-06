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
            $ website-diff reference
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
    const spinner = ora('Generating reference bitmaps ...').start();

    config.verbose || disableLogging();
    await backstop('reference', {config: config.paths.backstop_config});
    config.verbose || enableLogging();

    spinner.succeed(`Generated reference bitmaps in ${(new Date() - start) / 1000}s`);
}
