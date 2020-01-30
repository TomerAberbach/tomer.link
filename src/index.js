import { randomUniquePhrase } from './phrase'
import {
  insertRule,
  outputRedirects,
  readRedirects,
  ruleExists
} from './redirects'
import { isSimplePath, isURL } from './validation'
import error from './error'

const main = async () => {
  let [, , url, path] = process.argv.map(arg => arg.trim())

  if (url == null) {
    error(`usage: shorten <url> [path]`)
  }

  if (!isURL(url)) {
    error(`expected a URL, but got '${url}'.`)
    process.exit(1)
  }

  const { rules, extra } = await readRedirects()

  if (path == null) {
    path = `/${await randomUniquePhrase()}`
  } else {
    if (!path.startsWith(`/`)) {
      path = `/${path}`
    }

    if (!isSimplePath(path)) {
      error(`expected a path, but got '${path}'.`)
    }

    if (ruleExists({ rules, path })) {
      error(`'${path}' already exists in the redirects file.`)
    }
  }

  const rule = { from: path, to: url }
  insertRule({ rules, rule })

  await outputRedirects({ rules, extra })
}

const tryMain = async () => {
  try {
    await main()
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

tryMain()
