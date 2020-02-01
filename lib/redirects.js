"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.insertRule = exports.ruleExists = exports.outputRedirects = exports.readRedirects = void 0;

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/repeat"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/find-index"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/trim"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _mem = _interopRequireDefault(require("mem"));

var _fsExtra = require("fs-extra");

var _binarySearch = _interopRequireDefault(require("binary-search"));

var _error = _interopRequireDefault(require("./error"));

var _paths = require("./paths");

var _validation = require("./validation");

const readRedirects = (0, _mem.default)(async () => {
  var _context;

  const contents = (await (0, _fsExtra.readFile)((await (0, _paths.redirectsPath)()))).toString();
  let lines = (0, _map.default)(_context = contents.split(`\n`)).call(_context, line => (0, _trim.default)(line).call(line)); // Don't modify lines after empty line

  const emptyLineIndex = (0, _findIndex.default)(lines).call(lines, line => line.length === 0);
  let extra = ``;

  if (emptyLineIndex !== -1) {
    var _context2;

    extra = (0, _trim.default)(_context2 = (0, _slice.default)(lines).call(lines, emptyLineIndex).join(`\n`)).call(_context2);
    lines = (0, _slice.default)(lines).call(lines, 0, emptyLineIndex);
  }

  return {
    rules: (0, _map.default)(lines).call(lines, line => {
      if (!(0, _validation.isRedirect)(line)) {
        (0, _error.default)(`A \`_redirects\` file redirect must consist of a path, whitespace, and URL, in that order, but got '${line}'.`);
      }

      const [from, to] = line.split(/\s+/g);
      return {
        from,
        to
      };
    }),
    extra
  };
});
exports.readRedirects = readRedirects;

const outputRedirects = async ({
  rules,
  extra
}) => {
  const longestLength = Math.max(...(0, _map.default)(rules).call(rules, ({
    from,
    to
  }) => `${from}  ${to}`.length));
  const ruleContents = (0, _map.default)(rules).call(rules, ({
    from,
    to
  }) => {
    var _context3;

    return `${from}${(0, _repeat.default)(_context3 = ` `).call(_context3, longestLength - from.length - to.length)}${to}`;
  }).join(`\n`);
  const contents = `${ruleContents}\n\n${extra}`;
  await (0, _fsExtra.outputFile)((await (0, _paths.redirectsPath)()), contents);
};

exports.outputRedirects = outputRedirects;

const ruleSearch = ({
  rules,
  path
}) => (0, _binarySearch.default)(rules, {
  from: path
}, ({
  from
}, {
  from: needle
}) => from.localeCompare(needle));

const ruleExists = ({
  rules,
  path
}) => ruleSearch({
  rules,
  path
}) >= 0;

exports.ruleExists = ruleExists;

const insertRule = ({
  rules,
  rule
}) => {
  const pseudoIndex = ruleSearch({
    rules,
    path: rule.from
  });
  const index = -pseudoIndex - 1;
  (0, _splice.default)(rules).call(rules, index, 0, rule);
};

exports.insertRule = insertRule;