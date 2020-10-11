#!/usr/bin/env node

'use strict';

const meow = require('meow');

async function main() {
    const cli = meow(
        `
        Usage
            $ website-diff COMMAND [OPTIONS]

        Commands:
            init        Create config file
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

        case 'init':
            await require('./bin/init')();
            break;

        default:
            cli.showHelp();
            break;
    }

}

main();
