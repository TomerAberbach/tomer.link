import memoize from 'mem'
import { readFile, outputFile } from 'fs-extra'
import binarySearch from 'binary-search'
import error from './error'
import { redirectsPath } from './paths'
import { isRedirect } from './validation'

export const readRedirects = memoize(async () => {
  const contents = (await readFile(await redirectsPath())).toString()
  let lines = contents.split(`\n`).map(line => line.trim())

  // Don't modify lines after empty line
  const emptyLineIndex = lines.findIndex(line => line.length === 0)
  let extra = ``

  if (emptyLineIndex !== -1) {
    extra = lines
      .slice(emptyLineIndex)
      .join(`\n`)
      .trim()
    lines = lines.slice(0, emptyLineIndex)
  }

  return {
    rules: lines.map(line => {
      if (!isRedirect(line)) {
        error(
          `A \`_redirects\` file redirect must consist of a path, whitespace, and URL, in that order, but got '${line}'.`
        )
      }

      const [from, to] = line.split(/\s+/g)
      return { from, to }
    }),
    extra
  }
})

export const outputRedirects = async ({ rules, extra }) => {
  const longestLength = Math.max(
    ...rules.map(({ from, to }) => `${from}  ${to}`.length)
  )
  const ruleContents = rules
    .map(
      ({ from, to }) =>
        `${from}${` `.repeat(longestLength - from.length - to.length)}${to}`
    )
    .join(`\n`)
  const contents = `${ruleContents}\n\n${extra}`

  await outputFile(await redirectsPath(), contents)
}

const ruleSearch = ({ rules, path }) =>
  binarySearch(rules, { from: path }, ({ from }, { from: needle }) =>
    from.localeCompare(needle)
  )

export const ruleExists = ({ rules, path }) => ruleSearch({ rules, path }) >= 0

export const insertRule = ({ rules, rule }) => {
  const pseudoIndex = ruleSearch({ rules, path: rule.from })
  const index = -pseudoIndex - 1
  rules.splice(index, 0, rule)
}
