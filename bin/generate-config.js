#!/usr/bin/env node

'use strict';

const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const loadConfig = require('../lib/config');
const chalk = require('chalk');
const generate_config = require('../lib/generate-config');

module.exports = async () => {
    const cli = meow(
        `
        Usage
            $ website-diff generate [OPTIONS]

        Options:
            --url               Url to check
            --reference-url     Reference url to compare
            --config            Config file
        `,
        {
            flags: {
                config: {
                    type: 'string',
                    alias: 'c',
                },

                url: {
                    type: 'string'
                },

                referenceUrl: {
                    type: 'string'
                }
            }
        }
    );

    let config = loadConfig(cli.flags);

    if (! validurl(config.url)) {
        console.error(chalk.red(`> Error: "${config.url}" isn't a valid URL`));
        process.exit(1);
    }

    if (! validurl(config.referenceUrl)) {
        console.error(chalk.red(`> Error: "${config.url}" isn't a valid URL`));
        process.exit(1);
    }

    await generate_config(config.url, config.referenceUrl);
}
