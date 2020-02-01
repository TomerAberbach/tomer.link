import clipboard from 'clipboardy'
import { randomUniquePhrase } from './phrase'
import {
  insertRule,
  outputRedirects,
  readRedirects,
  ruleExists
} from './redirects'
import { isSimplePath, isURL } from './validation'
import * as git from './git'
import error from './error'

const main = async () => {
  let [, , url, path] = process.argv.map(arg => arg.trim())

  if (url == null) {
    error(`usage: shorten <url> [path]`)
  }

  if (!isURL(url)) {
    error(`expected a URL, but got '${url}'.`)
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

  const link = `https://tomer.link${path}`
  console.log(`Using ${link} -> ${url}.`)

  await git.pull()
  console.log(`Ran \`git pull\`.`)

  const rule = { from: path, to: url }
  insertRule({ rules, rule })
  await outputRedirects({ rules, extra })
  console.log(`Wrote redirect to \`_redirects\` file.`)

  await git.commit(`feat: ${link} -> ${url}`)
  console.log(`Ran \`git commit\`.`)

  await git.push()
  console.log(`Ran \`git push\`.`)

  await clipboard.write(link)
  console.log(`Copied '${link}' to clipboard.`)
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
