"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.readAnimals = void 0;

var _mem = _interopRequireDefault(require("mem"));

var _fsExtra = require("fs-extra");

const readAnimals = (0, _mem.default)(async () => await (0, _fsExtra.readJson)(`${__dirname}/data.json`));
exports.readAnimals = readAnimals;