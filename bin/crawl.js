#!/usr/bin/env node

'use strict';

const fs = require('fs');
const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const YAML = require('yaml')
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

    let config = {};

    try {
        config = YAML.parse(fs.readFileSync(cli.flags.config, 'utf8'));
    } catch (e) {
        console.warn(chalk.yellow(`> Warning: Cannot read config "${cli.flags.config}"`));
    }

    config = Object.assign(config, cli.flags);

    if (! validurl(config.url)) {
        console.error(chalk.red(`> Error: "${config.url}" isn't a valid URL`));
        process.exit(1);
    }

    crawl(config.url, config);
}
