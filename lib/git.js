"use strict";

exports.__esModule = true;
exports.push = exports.commit = exports.pull = void 0;

var _execa = _interopRequireDefault(require("execa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const git = (...args) => (0, _execa.default)(`git`, args);

const pull = () => git(`pull`);

exports.pull = pull;

const commit = message => git(`-am`, message);

exports.commit = commit;

const push = () => git(`push`);

exports.push = push;