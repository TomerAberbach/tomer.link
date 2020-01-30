"use strict";

var _phrase = require("./phrase");

var _redirects = require("./redirects");

var _validation = require("./validation");

var _error = _interopRequireDefault(require("./error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const main = async () => {
  let [,, url, path] = process.argv.map(arg => arg.trim());

  if (url == null) {
    (0, _error.default)(`usage: shorten <url> [path]`);
  }

  if (!(0, _validation.isURL)(url)) {
    (0, _error.default)(`expected a URL, but got '${url}'.`);
    process.exit(1);
  }

  const {
    rules,
    extra
  } = await (0, _redirects.readRedirects)();

  if (path == null) {
    path = `/${await (0, _phrase.randomUniquePhrase)()}`;
  } else {
    if (!path.startsWith(`/`)) {
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