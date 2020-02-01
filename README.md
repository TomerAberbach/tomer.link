# Babel Preset Node

> A configurable babel preset with straightforward options for developing and publishing ES2015+ Node modules.

## Install

Install with [`yarn`](https://legacy.yarnpkg.com/en/docs/install):

```bash
$ yarn add -D @tomera/babel-preset-node
```

Or with [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

```bash
$ npm i -D @tomera/babel-preset-node
```

If the `"fill"` option of the preset is set to anything but `false` (it defaults to `"pony"`),
then add `@babel/runtime-corejs3` to your dependencies using `yarn add @babel/runtime-corejs3` or `npm i @babel/runtime-corejs3`.

**NOTE:** This package provides a minimally transpiled variant through the [`"module"`](https://github.com/rollup/rollup/wiki/pkg.module) field of [`package.json`](https://github.com/TomerAberbach/babel-preset-node/blob/master/package.json).

## Usage

Add `@tomera/node` to the [`"presets"` array](https://babeljs.io/docs/en/presets) of your `.babelrc` file or other [Babel configuration file](https://babeljs.io/docs/en/config-files):

**.babelrc**

```json
{
  "presets": ["@tomera/node"]
}
```

### Options

- [`"module"`](https://babeljs.io/docs/en/babel-preset-env#modules)

  **Type:** `"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false`

  **Default:** `false`

  Configure transformation of ES6 module syntax to another module type.

  Set to `false` to disable module transformation (useful if using a bundler that handles module transformation).

  **NOTE:** `"cjs"` is just an alias for `"commonjs"`.

- `"fill"`

  **Type:** `"poly"` | `"pony"` | `false`

  **Default:** `"pony"`

  Configure implementation of features unsupported by the target Node version.

  Set to `"poly"` to enable [polyfilling](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill) using the [`"useBuiltIns": "entry"` option of `@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins).

  Set to `"pony"` to enable [ponyfilling](https://ponyfill.com) using the [transform-runtime Babel plugin](https://babeljs.io/docs/en/babel-plugin-transform-runtime).

  Set to `false` to disable implementation of features unsupported by the target Node version
  (useful if you expect the consumer of your library to implement the unsupported features).

- `"support"`

  **Type:** `"modern" | "legacy"`

  **Default:** `"modern"`

  Specify if the code should be transpiled to a modern Node version (your currently installed version) or
  to a legacy Node version (version 8).

- [`"debug"`](https://babeljs.io/docs/en/babel-preset-env#debug)

  **Type:** `boolean`

  **Default:** `false`

  Specify if debug information should be output using `console.log`.

### Examples

Most of the following examples require you to use the [Babel CLI](https://babeljs.io/docs/en/babel-cli) or a bundler, such as [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org),
to read your Babel configuration file and transpile your JavaScript code.

Some libraries or frameworks, such as [Jest](https://jestjs.io), automatically read your configuration file and transpile your
code as long as the proper dependencies are installed (`babel-jest` in Jest's case).

- A configuration for writing [Jest](https://jestjs.io) tests in ES2015+ JavaScript:

  **.babelrc**

  ```json
  {
    "env": {
      "test": {
        "presets": [
          [
            "@tomera/node",
            {
              "module": "commonjs",
              "support": "modern"
            }
          ]
        ]
      }
    }
  }
  ```

- A configuration for writing a library or CLI application in ES2015+ JavaScript:

  **.babelrc**

  ```json
  {
    "presets": [
      [
        "@tomera/node",
        {
          "module": "commonjs",
          "fill": "pony",
          "support": "legacy"
        }
      ]
    ]
  }
  ```

  If all of your dependencies support Node versions as far back as 8 then you can
  add the following to your `package.json` to indicate your library or CLI application supports
  Node versions as far back as 8:

  **package.json**

  ```json
  {
    "engines": {
      "node": ">=8.0.0"
    }
  }
  ```

  If you want to support Node versions as far back as 8, but one of your dependencies does not, then
  either switch out the nonsupporting dependency in favor of another or polyfill your dependencies instead
  of ponyfilling them (polyfills mutate the global namespace):

  ```json
  {
    "presets": [
      [
        "@tomera/node",
        {
          "module": "commonjs",
          "fill": "poly",
          "support": "legacy"
        }
      ]
    ]
  }
  ```

  If your code resides in a `src` directory and you have installed [`@babel/cli`](https://babeljs.io/docs/en/babel-cli) as a dev dependency
  (using `yarn add -D @babel/cli` or `npm i -D @babel/cli`), then you can transpile your code to a `lib`
  directory by running the following command from the root directory of your project:

  ```bash
  $ babel -D src -d lib
  ```

  Ensure the [`"main"`](https://docs.npmjs.com/files/package.json#main) field of `package.json` points to
  the entry point of your package in the `lib` directory and that the files in the `lib` directory are
  included in your package (perhaps using the [`"files"`](https://docs.npmjs.com/files/package.json#files) field of `package.json`).

  Lastly, you may choose to create a script for transpiling your code using the [`"scripts"`](https://docs.npmjs.com/files/package.json#scripts)
  field of `package.json` and set it to run prior to publishing:

  ```json
  {
    "scripts": {
      "build": "babel -D src -d lib",
      "prepublishOnly": "npm run build"
    }
  }
  ```

  You can now transpile your code by running `yarn build` or `npm run build`.

- A configuration file for writing a library that sets the [`"main"`](https://docs.npmjs.com/files/package.json#main)
  and [`"module"`](https://github.com/rollup/rollup/wiki/pkg.module) fields of `package.json`:

  **.babelrc**

  ```json
  {
    "env": {
      "main": {
        "presets": [
          [
            "@tomera/node",
            {
              "module": "commonjs",
              "support": "legacy"
            }
          ]
        ]
      },
      "module": {
        "presets": [
          [
            "@tomera/node",
            {
              "module": false,
              "fill": false,
              "support": "modern"
            }
          ]
        ]
      }
    }
  }
  ```

  The same caveats regarding supporting legacy Node versions in the previous example apply to
  the `"main"` environment of the current example.

  To transpile your code similarly to the previous example, add [`cross-env`](https://www.npmjs.com/package/cross-env)
  as a dev dependency (using `yarn add -D cross-env` or `npm i -D cross-env`) and run the following commands
  to transpile your code for the `"main"` and `"module"` targets, respectively:

  ```bash
  $ cross-env BABEL_ENV=main babel -D src -d lib/main
  $ cross-env BABEL_ENV=module babel -D src -d lib/module
  ```

  Ensure the [`"main"`](https://docs.npmjs.com/files/package.json#main) and [`"module"`](https://github.com/rollup/rollup/wiki/pkg.module) fields
  of `package.json` point to the entry points of your package in the `lib/main` and `lib/module` directories, respectively, and that the files in
  the `lib` directory are included in your package (perhaps using the [`"files"`](https://docs.npmjs.com/files/package.json#files) field of `package.json`).

  Lastly, you may choose to create a script for transpiling your code using the [`"scripts"`](https://docs.npmjs.com/files/package.json#scripts)
  field of `package.json` and set it to run prior to publishing:

  ```json
  {
    "scripts": {
      "build:main": "cross-env BABEL_ENV=main babel -D src -d lib/main",
      "build:module": "cross-env BABEL_ENV=module babel -D src -d lib/module",
      "build": "run-p build:*",
      "prepublishOnly": "npm run build"
    }
  }
  ```

  You'll need to add `npm-run-all` as a dev dependency (using `yarn add -D npm-run-all` and `npm i -D npm-run-all`)
  for the `run-p` command and `"build"` script to work.

  You can now transpile your code for the `"main"` and `"module"` targets concurrently by running
  `yarn build` or `npm run build`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/TomerAberbach/babel-preset-node/issues/new).

### Development

#### Setup

1. Clone the repository:
   - SSH:
     ```bash
     $ git clone git@github.com:TomerAberbach/babel-preset-node.git
     ```
   - HTTPS:
     ```bash
     $ git clone https://github.com/TomerAberbach/babel-preset-node.git
     ```
2. Change your current working directory to the newly created `babel-preset-node` directory:
   ```bash
   $ cd babel-preset-node
   ```
3. Install dependencies:
   - Yarn:
     ```bash
     $ yarn install
     ```
   - NPM
     ```bash
     $ npm i
     ```

#### Linting

Run `yarn lint` or `npm run lint`.

#### Testing

Run `yarn test` or `npm test`.

#### Building

Run `yarn build` or `npm run build`.

## Author

**Tomer Aberbach**

- [Github](https://github.com/TomerAberbach)
- [NPM](https://www.npmjs.com/~tomeraberbach)
- [LinkedIn](https://www.linkedin.com/in/tomer-a)
- [Website](https://tomeraberba.ch)

## License

Copyright © 2020 [Tomer Aberbach](https://github.com/TomerAberbach)
Released under the [MIT license](https://github.com/TomerAberbach/babel-preset-node/blob/master/LICENSE).
