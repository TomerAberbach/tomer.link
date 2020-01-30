"use strict";

exports.__esModule = true;
exports.randomUniquePhrase = exports.randomPhrase = void 0;

var _random = _interopRequireDefault(require("./random"));

var _adjectives = require("./adjectives");

var _animals = require("./animals");

var _redirects = require("../redirects");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const randomPhrase = async () => {
  const [adjective, animal] = await Promise.all([_adjectives.readAdjectives, _animals.readAnimals].map(async read => (0, _random.default)((await read()))));
  return `${adjective}-${animal}`;
};

exports.randomPhrase = randomPhrase;

const randomUniquePhrase = async () => {
  const {
    rules
  } = await (0, _redirects.readRedirects)();
  let phrase;

  do {
    phrase = await randomPhrase();
  } while ((0, _redirects.ruleExists)({
    rules,
    path: `/${phrase}`
  }));

  return phrase;
};

exports.randomUniquePhrase = randomUniquePhrase;