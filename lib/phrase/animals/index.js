"use strict";

exports.__esModule = true;
exports.readAnimals = void 0;

var _mem = _interopRequireDefault(require("mem"));

var _fsExtra = require("fs-extra");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readAnimals = (0, _mem.default)(async () => await (0, _fsExtra.readJson)(`${__dirname}/data.json`));
exports.readAnimals = readAnimals;