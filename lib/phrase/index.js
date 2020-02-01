"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.randomUniquePhrase = exports.randomPhrase = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _random = _interopRequireDefault(require("./random"));

var _adjectives = require("./adjectives");

var _animals = require("./animals");

var _redirects = require("../redirects");

const randomPhrase = async () => {
  var _context;

  const [adjective, animal] = await _promise.default.all((0, _map.default)(_context = [_adjectives.readAdjectives, _animals.readAnimals]).call(_context, async read => (0, _random.default)((await read()))));
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