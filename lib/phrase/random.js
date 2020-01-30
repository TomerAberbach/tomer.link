"use strict";

exports.__esModule = true;
exports.default = void 0;

var _randomNumberCsprng = _interopRequireDefault(require("random-number-csprng"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const random = async values => values[(await (0, _randomNumberCsprng.default)(0, values.length - 1))];

var _default = random;
exports.default = _default;