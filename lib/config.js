'use strict';

const fs = require('fs');
const YAML = require('yaml')

module.exports = (extra = {}) => {
    const DEFAULT_FILE = `${__dirname}/config-defaults.yml`;
    const CONFIG_FILE = extra.config || 'website-diff.yml';

    let defaults = YAML.parse(fs.readFileSync(DEFAULT_FILE, 'utf8'));
    let config = {}

    try {
        config = YAML.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        console.warn(chalk.yellow(`> Warning: Cannot read config "${cli.flags.config}"`));
    }

    return Object.assign({}, defaults, config, extra);
};
