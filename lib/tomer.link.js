function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var clipboard = _interopDefault(require('clipboardy'));
var randomNumber = _interopDefault(require('random-number-csprng'));
var fsExtra = require('fs-extra');
var binarySearch = _interopDefault(require('binary-search'));
var memoize = _interopDefault(require('mem'));
var pkgUp = _interopDefault(require('pkg-up'));
var path = _interopDefault(require('path'));
var url = require('url');
var exec = _interopDefault(require('execa'));

// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a do ... while loop
function _do(body, test) {
	var awaitBody;
	do {
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.v;
			} else {
				awaitBody = true;
				break;
			}
		}
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
	} while (!shouldContinue.then);
	const pact = new _Pact();
	const reject = _settle.bind(null, pact, 2);
	(awaitBody ? result.then(_resumeAfterBody) : shouldContinue.then(_resumeAfterTest)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		for (;;) {
			shouldContinue = test();
			if (_isSettledPact(shouldContinue)) {
				shouldContinue = shouldContinue.v;
			}
			if (!shouldContinue) {
				break;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (result && result.then) {
				if (_isSettledPact(result)) {
					result = result.v;
				} else {
					result.then(_resumeAfterBody).then(void 0, reject);
					return;
				}
			}
		}
		_settle(pact, 1, result);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			do {
				result = body();
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_resumeAfterBody).then(void 0, reject);
						return;
					}
				}
				shouldContinue = test();
				if (_isSettledPact(shouldContinue)) {
					shouldContinue = shouldContinue.v;
				}
				if (!shouldContinue) {
					_settle(pact, 1, result);
					return;
				}
			} while (!shouldContinue.then);
			shouldContinue.then(_resumeAfterTest).then(void 0, reject);
		} else {
			_settle(pact, 1, result);
		}
	}
}

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var random = function (values) {
  try {
    return Promise.resolve(randomNumber(0, values.length - 1)).then(function (_randomNumber) {
      return values[_randomNumber];
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var readAdjectives = memoize(function () { return fsExtra.readJson(((process.cwd()) + "/data/adjectives.json")); });

var readAnimals = memoize(function () { return fsExtra.readJson(((process.cwd()) + "/data/animals.json")); });

var error = function (message) {
  throw new Error(("Error: " + message));
};

var packagePath = memoize(pkgUp);
var projectPath = memoize(function () {
  try {
    var _dirname = path.dirname;
    return Promise.resolve(packagePath()).then(function (_packagePath) {
      return _dirname.call(path, _packagePath);
    });
  } catch (e) {
    return Promise.reject(e);
  }
});
var redirectsPath = memoize(function () {
  try {
    var _join = path.join;
    return Promise.resolve(projectPath()).then(function (_projectPath) {
      return _join.call(path, _projectPath, "_redirects");
    });
  } catch (e) {
    return Promise.reject(e);
  }
});

var isSimplePath = function (string) {
  if (string.endsWith("/*")) {
    string = string.substring(0, string.length - 2);
  }

  if (string.lastIndexOf('/') !== 0) {
    return false;
  }

  try {
    var url$$1 = new url.URL(string, "https://example.com");
    return ["username", "password", "port", "search", "hash"].every(function (field) { return url$$1[field].length === 0; }) && url$$1.pathname.length > 1;
  } catch (e) {
    return false;
  }
};
var isURL = function (string) {
  try {
    new url.URL(string);
    return true;
  } catch (e) {
    return false;
  }
};
var isRedirect = function (string) {
  var parts = string.split(/\s+/g);

  if (parts.length !== 2) {
    return false;
  }

  var from = parts[0];
  var to = parts[1];
  return isSimplePath(from) && isURL(to);
};

var readRedirects = memoize(function () {
  try {
    return Promise.resolve(redirectsPath()).then(function (_redirectsPath) {
      return Promise.resolve(fsExtra.readFile(_redirectsPath)).then(function (_readFile) {
        var contents = _readFile.toString();

        var lines = contents.split("\n").map(function (line) { return line.trim(); }); // Don't modify lines after empty line

        var emptyLineIndex = lines.findIndex(function (line) { return line.length === 0; });
        var extra = "";

        if (emptyLineIndex !== -1) {
          extra = lines.slice(emptyLineIndex).join("\n").trim();
          lines = lines.slice(0, emptyLineIndex);
        }

        return {
          rules: lines.map(function (line) {
            if (!isRedirect(line)) {
              error(("A `_redirects` file redirect must consist of a path, whitespace, and URL, in that order, but got '" + line + "'."));
            }

            var ref = line.split(/\s+/g);
            var from = ref[0];
            var to = ref[1];
            return {
              from: from,
              to: to
            };
          }),
          extra: extra
        };
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
});
var outputRedirects = function (ref) {
  var rules = ref.rules;
  var extra = ref.extra;

  try {
    var longestLength = Math.max.apply(Math, rules.map(function (ref) {
      var from = ref.from;
      var to = ref.to;

      return (from + "  " + to).length;
    }));
    var ruleContents = rules.map(function (ref) {
      var from = ref.from;
      var to = ref.to;

      return ("" + from + (" ".repeat(longestLength - from.length - to.length)) + to);
    }).join("\n");
    var contents = ruleContents + "\n\n" + extra;
    return Promise.resolve(redirectsPath()).then(function (_redirectsPath2) {
      return Promise.resolve(fsExtra.outputFile(_redirectsPath2, contents)).then(function () {});
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var ruleSearch = function (ref) {
  var rules = ref.rules;
  var path$$1 = ref.path;

  return binarySearch(rules, {
  from: path$$1
}, function (ref, ref$1) {
  var from = ref.from;
  var needle = ref$1.from;

  return from.localeCompare(needle);
  });
};

var ruleExists = function (ref) {
  var rules = ref.rules;
  var path$$1 = ref.path;

  return ruleSearch({
  rules: rules,
  path: path$$1
}) >= 0;
};
var insertRule = function (ref) {
  var rules = ref.rules;
  var rule = ref.rule;

  var pseudoIndex = ruleSearch({
    rules: rules,
    path: rule.from
  });
  var index = -pseudoIndex - 1;
  rules.splice(index, 0, rule);
};

var randomPhrase = function () {
  try {
    return Promise.resolve(Promise.all([readAdjectives, readAnimals].map(function (read) {
      try {
        return Promise.resolve(read()).then(random);
      } catch (e) {
        return Promise.reject(e);
      }
    }))).then(function (ref) {
      var adjective = ref[0];
      var animal = ref[1];

      return (adjective + "-" + animal);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var randomUniquePhrase = function () {
  try {
    return Promise.resolve(readRedirects()).then(function (ref) {
      var rules = ref.rules;

      var phrase;

      var _temp = _do(function () {
        return Promise.resolve(randomPhrase()).then(function (_randomPhrase) {
          phrase = _randomPhrase;
        });
      }, function () {
        return !!ruleExists({
          rules: rules,
          path: ("/" + phrase)
        });
      });

      return _temp && _temp.then ? _temp.then(function () {
        return phrase;
      }) : phrase;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var git = function () {
	var args = [], len = arguments.length;
	while ( len-- ) args[ len ] = arguments[ len ];

	return exec("git", args);
};

var pull = function () { return git("pull"); };
var commit = function (message) { return git("commit", "-am", message); };
var push = function () { return git("push"); };

var input = function () {
  try {
    var ref = process.argv.map(function (arg) { return arg.trim(); });
    var url$$1 = ref[2];
    var path$$1 = ref[3];

    if (url$$1 == null) {
      error("usage: short <url> [path]");
    }

    if (!isURL(url$$1)) {
      error(("expected a URL, but got '" + url$$1 + "'."));
    }

    return Promise.resolve(readRedirects()).then(function (ref) {
      var rules = ref.rules;

      function _temp2() {
        return {
          from: path$$1,
          to: url$$1
        };
      }

      var _temp = function () {
        if (path$$1 == null) {
          return Promise.resolve(randomUniquePhrase()).then(function (_randomUniquePhrase) {
            path$$1 = "/" + _randomUniquePhrase;
          });
        } else {
          if (!path$$1.startsWith("/")) {
            path$$1 = "/" + path$$1;
          }

          if (!isSimplePath(path$$1)) {
            error(("expected a path, but got '" + path$$1 + "'."));
          }

          if (ruleExists({
            rules: rules,
            path: path$$1
          })) {
            error(("'" + path$$1 + "' already exists in the redirects file."));
          }
        }
      }();

      return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var main = function () {
  try {
    return Promise.resolve(input()).then(function (rule) {
      var link = "https://tomer.link" + (rule.from);
      console.log(("Creating redirect from " + link + " to " + (rule.to) + "."));
      console.log();
      process.stdout.write("Running `git pull`...");
      return Promise.resolve(pull()).then(function () {
        console.log(" Done.");
        process.stdout.write("Writing redirect to  `_redirects` file...");
        return Promise.resolve(readRedirects()).then(function (ref) {
          var rules = ref.rules;
          var extra = ref.extra;

          insertRule({
            rules: rules,
            rule: rule
          });
          return Promise.resolve(outputRedirects({
            rules: rules,
            extra: extra
          })).then(function () {
            console.log(" Done.");
            var message = "feat: " + link + " -> " + (rule.to);
            process.stdout.write(("Running `git commit -am '" + message + "'`..."));
            return Promise.resolve(commit(message)).then(function () {
              console.log(" Done.");
              process.stdout.write("Running `git push`...");
              return Promise.resolve(push()).then(function () {
                console.log(" Done.");
                return Promise.resolve(clipboard.write(link)).then(function () {
                  console.log(("Copied '" + link + "' to clipboard."));
                });
              });
            });
          });
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var tryMain = function () {
  try {
    var _temp3 = _catch(function () {
      return Promise.resolve(main()).then(function () {});
    }, function (e) {
      console.error(e.message);
      process.exit(1);
    });

    return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
  } catch (e) {
    return Promise.reject(e);
  }
};

tryMain();
//# sourceMappingURL=tomer.link.js.map
