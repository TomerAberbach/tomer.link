"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.redirectsPath = exports.projectPath = exports.packagePath = void 0;

var _mem = _interopRequireDefault(require("mem"));

var _pkgUp = _interopRequireDefault(require("pkg-up"));

var _path = _interopRequireDefault(require("path"));

const packagePath = (0, _mem.default)(_pkgUp.default);
exports.packagePath = packagePath;
const projectPath = (0, _mem.default)(async () => _path.default.dirname((await packagePath())));
exports.projectPath = projectPath;
const redirectsPath = (0, _mem.default)(async () => _path.default.join((await projectPath()), `_redirects`));
exports.redirectsPath = redirectsPath;