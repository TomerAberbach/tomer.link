"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/starts-with"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/trim"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _clipboardy = _interopRequireDefault(require("clipboardy"));

var _phrase = require("./phrase");

var _redirects = require("./redirects");

var _validation = require("./validation");

var git = _interopRequireWildcard(require("./git"));

var _error = _interopRequireDefault(require("./error"));

const input = async () => {
  var _context;

  let [,, url, path] = (0, _map.default)(_context = process.argv).call(_context, arg => (0, _trim.default)(arg).call(arg));

  if (url == null) {
    (0, _error.default)(`usage: shorten <url> [path]`);
  }

  if (!(0, _validation.isURL)(url)) {
    (0, _error.default)(`expected a URL, but got '${url}'.`);
  }

  const {
    rules
  } = await (0, _redirects.readRedirects)();

  if (path == null) {
    path = `/${await (0, _phrase.randomUniquePhrase)()}`;
  } else {
    if (!(0, _startsWith.default)(path).call(path, `/`)) {
      path = `/${path}`;
    }

    if (!(0, _validation.isSimplePath)(path)) {
      (0, _error.default)(`expected a path, but got '${path}'.`);
    }

    if ((0, _redirects.ruleExists)({
      rules,
      path
    })) {
      (0, _error.default)(`'${path}' already exists in the redirects file.`);
    }
  }

  return {
    from: path,
    to: url
  };
};

const main = async () => {
  const rule = await input();
  const link = `https://tomer.link${rule.from}`;
  console.log(`Creating redirect from ${link} to ${rule.to}.`);
  console.log();
  process.stdout.write(`Running \`git pull\`...`);
  await git.pull();
  console.log(` Done.`);
  process.stdout.write(`Writing redirect to  \`_redirects\` file...`);
  const {
    rules,
    extra
  } = await (0, _redirects.readRedirects)();
  (0, _redirects.insertRule)({
    rules,
    rule
  });
  await (0, _redirects.outputRedirects)({
    rules,
    extra
  });
  console.log(` Done.`);
  const message = `feat: ${link} -> ${rule.to}`;
  process.stdout.write(`Running \`git commit -am '${message}'\`...`);
  await git.commit(message);
  console.log(` Done.`);
  process.stdout.write(`Running \`git push\`...`);
  await git.push();
  console.log(` Done.`);
  await _clipboardy.default.write(link);
  console.log(`Copied '${link}' to clipboard.`);
};

const tryMain = async () => {
  try {
    await main();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

tryMain();