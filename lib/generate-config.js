'use strict';

const path = require('path');
const fs = require('fs');
const YAML = require('yaml')
const ora = require('ora');
const jsonfile = require('jsonfile');
const CONFIG_FILE = 'config.yml';

module.exports = async (url, referenceUrl) => {
    return new Promise((res, rej) => {
        const spinner = ora('Generating config...');
        spinner.start();

        const config = YAML.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

        const BACKSTOP_TEMPLATE_FILE = config.paths.backstop_template || './backstop.yml';
        const BACKSTOP_CONFIG_FILE = config.paths.backstop_config || './backstop.json';
        const SITES_FILE = config.paths.sites || './sites.yml';

        const paths = YAML.parse(fs.readFileSync(SITES_FILE, 'utf8')).paths;
        const backstop = YAML.parse(fs.readFileSync(BACKSTOP_TEMPLATE_FILE, 'utf8'));
        const scenarioConfig = backstop.scenario;
        delete backstop.scenario;

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
