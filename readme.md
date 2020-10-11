# website-diff

Tool for crawling a website and running visual regression tests using [BackstopJS](https://github.com/garris/BackstopJS).

## Installation
Clone the repo and install it globally so the `website-diff` command is registered.

```bash
git clone https://github.com/pxlrbt/website-diff.git
cd website-diff
npm install -g ./
```

## Usage

### Initialize
Publish the config file.
```bash
website-diff init
```
### Crawl a site
Crawls a site based on the config in `website-diff.yml` and stores the results in `sites.yml` so it can be modified before generating a config.
```bash
website-diff crawl
```

You can limit crawling pages with a common root url (e.g /blog/, /products/) with the `limitSimilar` option.

### Generate BackstopJS config
Generates the required `backstop.json` from `backstop.yml` template file. You can define a default config for every scenario using `scenario.default` config option.
A custom config for individual paths can be set with `scenario.custom[/path/to/page]`.

```bash
website-diff generate
```

`backstop.yml` supports all options of `backstop.json` plus the additional `scenario` option that will be used as a template for all scenarios.

### Run BackstopJS
Run the visual regression test with `website-diff run`. This will generate a new config file from your template, your `backstop reference` and `backstop test` in sequence.

## Notes
The crawler is a modified version of [backstop-crawl](https://github.com/fffunction/backstop-crawl).
