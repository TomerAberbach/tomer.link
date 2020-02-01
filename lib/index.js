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

const main = async () => {
  var _context;

  let [,, url, path] = (0, _map.default)(_context = process.argv).call(_context, arg => (0, _trim.default)(arg).call(arg));

  if (url == null) {
    (0, _error.default)(`usage: shorten <url> [path]`);
  }

  if (!(0, _validation.isURL)(url)) {
    (0, _error.default)(`expected a URL, but got '${url}'.`);
  }

  const {
    rules,
    extra
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

  const link = `https://tomer.link${path}`;
  console.log(`Using ${link} -> ${url}.`);
  await git.pull();
  console.log(`Ran \`git pull\`.`);
  const rule = {
    from: path,
    to: url
  };
  (0, _redirects.insertRule)({
    rules,
    rule
  });
  await (0, _redirects.outputRedirects)({
    rules,
    extra
  });
  console.log(`Wrote redirect to \`_redirects\` file.`);
  await git.commit(`feat: ${link} -> ${url}`);
  console.log(`Ran \`git commit\`.`);
  await git.push();
  console.log(`Ran \`git push\`.`);
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