"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isRedirect = exports.isURL = exports.isSimplePath = void 0;

var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/every"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _lastIndexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/last-index-of"));

var _url = require("url");

const isSimplePath = string => {
  if ((0, _lastIndexOf.default)(string).call(string, '/') !== 0 || (0, _indexOf.default)(string).call(string, `*`) !== -1) {
    return false;
  }

  try {
    var _context;

    const url = new _url.URL(string, `https://example.com`);
    return (0, _every.default)(_context = [`username`, `password`, `port`, `search`, `hash`]).call(_context, field => url[field].length === 0) && url.pathname.length > 1;
  } catch {
    return false;
  }
};

exports.isSimplePath = isSimplePath;

const isURL = string => {
  try {
    new _url.URL(string);
    return true;
  } catch {
    return false;
  }
};

exports.isURL = isURL;

const isRedirect = string => {
  const parts = string.split(/\s+/g);

  if (parts.length !== 2) {
    return false;
  }

  const [from, to] = parts;
  return isSimplePath(from) && isURL(to);
};

exports.isRedirect = isRedirect;