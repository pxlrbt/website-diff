#!/usr/bin/env node

'use strict';

const fs = require('fs');
const meow = require('meow');

module.exports = () => {
    const cli = meow(
        `
        Usage
            $ website-diff init
        `,
    );

    let configFile = 'config.yml';
    let configTemplate = `${__dirname}/../lib/config-defaults.yml`;

    fs.copyFileSync(
        configTemplate,
        configFile
    );
}
