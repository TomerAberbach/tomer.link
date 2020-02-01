"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.push = exports.commit = exports.pull = void 0;

var _execa = _interopRequireDefault(require("execa"));

const git = (...args) => (0, _execa.default)(`git`, args);

const pull = () => git(`pull`);

exports.pull = pull;

const commit = message => git(`-a`, `-m`, message);

exports.commit = commit;

const push = () => git(`push`);

exports.push = push;