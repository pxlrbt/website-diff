#!/usr/bin/env node

'use strict';

const meow = require('meow');
const ora = require('ora');
const backstop = require('backstopjs')
const {enableLogging, disableLogging} = require('../lib/logging');

module.exports = async () => {
    const cli = meow(
        `
        Usage
            $ website-diff reference
        `,
        {
            v: {
                type: 'boolean'
            }
        }
    );

    const start = +new Date();
    const spinner = ora('Generating reference bitmaps ...').start();

    cli.flags.v || disableLogging();
    await backstop('reference');
    cli.flags.v || enableLogging();

    spinner.succeed(`Generated reference bitmaps in ${(new Date() - start) / 1000}s`);
}
