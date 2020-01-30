"use strict";

exports.__esModule = true;
exports.insertRule = exports.ruleExists = exports.outputRedirects = exports.readRedirects = void 0;

var _mem = _interopRequireDefault(require("mem"));

var _fsExtra = require("fs-extra");

var _binarySearch = _interopRequireDefault(require("binary-search"));

var _error = _interopRequireDefault(require("./error"));

var _paths = require("./paths");

var _validation = require("./validation");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readRedirects = (0, _mem.default)(async () => {
  const contents = (await (0, _fsExtra.readFile)((await (0, _paths.redirectsPath)()))).toString();
  let lines = contents.split(`\n`).map(line => line.trim()); // Don't modify lines after empty line

  const emptyLineIndex = lines.findIndex(line => line.length === 0);
  let extra = ``;

  if (emptyLineIndex !== -1) {
    extra = lines.slice(emptyLineIndex).join(`\n`).trim();
    lines = lines.slice(0, emptyLineIndex);
  }

  return {
    rules: lines.map(line => {
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
  const longestLength = Math.max(...rules.map(({
    from,
    to
  }) => `${from}  ${to}`.length));
  const ruleContents = rules.map(({
    from,
    to
  }) => `${from}${` `.repeat(longestLength - from.length - to.length)}${to}`).join(`\n`);
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
  rules.splice(index, 0, rule);
};

exports.insertRule = insertRule;