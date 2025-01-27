'use strict';

const path = require('path');
const fs = require('fs');
const YAML = require('yaml')
const ora = require('ora');
const jsonfile = require('jsonfile');
const loadConfig = require('../lib/config');
const { log } = require('console');

function merge(source, target) {
    for (const [key, val] of Object.entries(source)) {
      if (val !== null && typeof val === `object`) {
        if (target[key] === undefined) {
          target[key] = new val.__proto__.constructor();
        }
        merge(val, target[key]);
      } else {
        target[key] = val;
      }
    }
    return target; // we're replacing in-situ, so this is more for chaining than anything else
}

module.exports = async (url, referenceUrl) => {
    return new Promise((res, rej) => {
        const spinner = ora('Generating config...');
        spinner.start();

        const config = loadConfig();

        const DEFAULT_FILE = `${__dirname}/backstop-defaults.yml`;
        const backstopDefaults = YAML.parse(fs.readFileSync(DEFAULT_FILE, 'utf8'));

        const BACKSTOP_TEMPLATE_FILE = config.paths.backstop_template || './backstop.yml';
        const BACKSTOP_CONFIG_FILE = config.paths.backstop_config || './backstop.json';
        const SITES_FILE = config.paths.sites || './sites.yml';

        const paths = YAML.parse(fs.readFileSync(SITES_FILE, 'utf8')).paths;
        const backstopConfig = YAML.parse(fs.readFileSync(BACKSTOP_TEMPLATE_FILE, 'utf8'));
        const scenarioConfig = backstopConfig.scenario;
        delete backstopConfig.scenario;

        const backstop = merge(backstopConfig, backstopDefaults)

        const domain = referenceUrl.replace('https://', '')

        backstop.paths = {
            bitmaps_reference: '/Users/dkoch/Code/_backstop/' + domain + '/reference',
            bitmaps_test: '/Users/dkoch/Code/_backstop/' + domain + '/test',
            html_report: '/Users/dkoch/Code/_backstop/' + domain + '/report',
            engine_scripts: 'backstop/scripts',
            ...backstop.paths,
        }

        backstop.scenarios = paths.map(path => {
            let trimmedPath = path.replace(/\/$/, '');
            if (trimmedPath.length === 0) {
                trimmedPath = '/'
            }

            let scenario = trimmedPath in scenarioConfig.custom
                ? Object.assign({}, scenarioConfig.default, scenarioConfig.custom[trimmedPath])
                : Object.assign({}, scenarioConfig.default);

            scenario.label = trimmedPath;
            scenario.url = url + path;
            scenario.referenceUrl = referenceUrl + path;

            return scenario;
        });

        try {
            fs.mkdirSync(path.dirname(BACKSTOP_CONFIG_FILE), {recursive: true});
            jsonfile.writeFileSync(BACKSTOP_CONFIG_FILE, backstop, {spaces: 2});

            spinner.text = 'Generated backstop.json config.';
            spinner.succeed();
            res();
        } catch (e) {
            spinner.text = mkpathErr;
            spinner.fail();
            rej();
        }
    })
};
