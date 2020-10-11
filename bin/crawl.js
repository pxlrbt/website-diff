#!/usr/bin/env node

'use strict';

const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const loadConfig = require('../lib/config');
const chalk = require('chalk');
const crawl = require('../lib/crawl');

module.exports = () => {
    const cli = meow(
        `
        Usage
            $ website-diff crawl [OPTIONS]

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
                    default: './config.yml'
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

    crawl(config.url, config);
}
