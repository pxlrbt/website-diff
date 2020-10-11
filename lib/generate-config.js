'use strict';


const path = require('path');
const fs = require('fs');
const YAML = require('yaml')
const ora = require('ora');
const mkpath = require('mkpath');
const jsonfile = require('jsonfile');

const dirname = path.dirname;

let paths = [];
let outfile = './backstop.json';

const CONFIG_FILE = 'backstop.yml';
const SITES_FILE = 'sites.yml';

module.exports = async (url, referenceUrl) => {
    return new Promise((res, rej) => {
        const spinner = ora('Generating config...');
        spinner.start();

        const paths = YAML.parse(fs.readFileSync(SITES_FILE, 'utf8')).paths;
        const config = YAML.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        const scenarioConfig = config.scenario;
        delete config.scenario;

        config.scenarios = paths.map(path => {
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

        const outPath = dirname(outfile);
        mkpath(outPath, mkpathErr => {
            if (mkpathErr) {
                spinner.text = mkpathErr;
                spinner.fail();
            } else {
                fs.writeFileSync(
                    outfile,
                    paths.join("\n")
                );

                jsonfile.writeFile(
                    outfile,
                    config,
                    { spaces: 4 },
                    jsonfileErr => {
                        if (jsonfileErr) {
                            spinner.text = jsonfileErr;
                            spinner.fail();
                            rej()
                        } else {
                            spinner.text = 'Generated backstop.json config.';
                            spinner.succeed();
                            res();
                        }
                    }
                );
            }
        });
    })
};
