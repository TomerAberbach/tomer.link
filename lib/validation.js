"use strict";

exports.__esModule = true;
exports.isRedirect = exports.isURL = exports.isSimplePath = void 0;

var _url = require("url");

const isSimplePath = string => {
  if (string.lastIndexOf('/') !== 0 || string.indexOf(`*`) !== -1) {
    return false;
  }

  try {
    const url = new _url.URL(string, `https://example.com`);
    return [`username`, `password`, `port`, `search`, `hash`].every(field => url[field].length === 0) && url.pathname.length > 1;
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