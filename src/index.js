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

const input = async () => {
  let [, , url, path] = process.argv.map(arg => arg.trim())

  if (url == null) {
    error(`usage: short <url> [path]`)
  }

  if (!isURL(url)) {
    error(`expected a URL, but got '${url}'.`)
  }

  const { rules } = await readRedirects()

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

  return { from: path, to: url }
}

const main = async () => {
  const rule = await input()

  const link = `https://tomer.link${rule.from}`
  console.log(`Creating redirect from ${link} to ${rule.to}.`)
  console.log()

  process.stdout.write(`Running \`git pull\`...`)
  await git.pull()
  console.log(` Done.`)

  process.stdout.write(`Writing redirect to  \`_redirects\` file...`)
  const { rules, extra } = await readRedirects()
  insertRule({ rules, rule })
  await outputRedirects({ rules, extra })
  console.log(` Done.`)

  const message = `feat: ${link} -> ${rule.to}`
  process.stdout.write(`Running \`git commit -am '${message}'\`...`)
  await git.commit(message)
  console.log(` Done.`)

  process.stdout.write(`Running \`git push\`...`)
  await git.push()
  console.log(` Done.`)

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
