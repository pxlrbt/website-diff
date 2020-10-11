#!/usr/bin/env node

'use strict';

const fs = require('fs');
const meow = require('meow');
const YAML = require('yaml')
const chalk = require('chalk');

async function main() {
    const cli = meow(
        `
        Usage
            $ website-diff COMMAND [OPTIONS]

        Commands:
            crawl       Crawl a site
            generate    Generate backstop config
            reference   Create backstop reference data
            test        Run backstop test

            run         Run all command in sequence

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

    if (cli.input.length == 0) {
        cli.showHelp();
        process.exit(0);
    }

    switch (cli.input[0]) {
        case 'crawl':
            require('./bin/crawl')();
            break;

        case 'generate':
            await require('./bin/generate-config')();
            break;

        case 'reference':
            await require('./bin/reference')();
            break;

        case 'test':
            await require('./bin/test')();
            break;

        case 'run':
            await require('./bin/generate-config')();
            await require('./bin/reference')();
            await require('./bin/test')();
            break;

        default:
            cli.showHelp();
            break;
    }

}

main();
