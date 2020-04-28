import memoize from 'mem'
import { readJson } from 'fs-extra'

export const readAdjectives = memoize(() => readJson(`${process.cwd()}/data/adjectives.json`))
