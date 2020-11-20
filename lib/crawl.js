'use strict';

const path = require('path');
const fs = require('fs');
const Crawler = require('simplecrawler');
const ora = require('ora');
const cliTruncate = require('cli-truncate');
const cheerio = require('cheerio');
const YAML = require('yaml')
const filterSimilar = require('./filter-similar');
const loadConfig = require('../lib/config');

const EXT_BLACKLIST = /(\?|page\/\d+|(\.pdf|\.js|\.css|\.png|\.jpg|\.jpeg|\.gif|\.json|\.xml|\.txt|\.zip|\.rar$))/i;
const SPINNER_WIDTH = 2;
let urls = [];

module.exports = (url, flags) => {
    const config = loadConfig(flags);
    const SITES_FILE = config.paths.sites || './sites.yml';


    const spinner = ora('Crawling...').start();
    const start = +new Date();
    const crawler = new Crawler(url);

    crawler.discoverResources = function(buffer) {
        const $ = cheerio.load(buffer.toString('utf8'));

        return $('a[href]')
            .map((i, el)  => $(el).attr('href'))
            .get();
    };

    crawler.stripQuerystring = true;
    // crawler.maxConcurrency = 50;

    if (flags.ignoreRobots) {
        crawler.respectRobotsTxt = false;
    }

    if (flags.ignoreSslErrors) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        crawler.ignoreInvalidSSL = true;
    }

    if (flags.outfile) {
        outfile = flags.outfile;
    }

    if (flags.debug) {
        const errors = [
            'queueerror',
            'robotstxterror',
            'cookieerror',
            'fetchdataerror',
            'fetcherror',
            'gziperror',
        ];

        errors.forEach(error => {
            crawler.on(error, err => spinner.fail(err));
        });
    }

    if (flags.allowSubdomains) {
        crawler.scanSubdomains = true;
    }

    // Skip this small blacklist of extensions
    crawler.addFetchCondition(
        queueItem => !queueItem.path.match(EXT_BLACKLIST)
                        && filterSimilar(queueItem.path, flags.limitSimilar)
    );

    // Update spinner with current path
    crawler.on('fetchstart', queueItem => {
        const cols = Math.max(process.stdout.columns - SPINNER_WIDTH, 1);
        spinner.text = cliTruncate(queueItem.path, cols);
    });

    // If the document was html then add it to the list
    // This might not be necessary since we're filtering the
    // extensions above, and a local server may not be returning
    // the correct mimetypes/headers
    crawler.on('fetchcomplete', queueItem => {
        if (queueItem.stateData.contentType.indexOf('text/html') > -1) {
            urls.push(queueItem.path);
        }
    });

    // Done. Output the file
    crawler.on('complete', () => {
        try {
            fs.mkdirSync(path.dirname(SITES_FILE), {recursive: true});
            fs.writeFileSync(
                SITES_FILE,
                YAML.stringify({
                    url: url,
                    paths: urls.sort()
                })
            );

            spinner.succeed(`Found ${urls.length} urls in ${(new Date() - start) / 1000}s`);
        } catch (e) {
            spinner.fail(e.message);
            process.exit(1);
        }
    });

    crawler.start();
}
