import memoize from 'mem'
import { readJson } from 'fs-extra'

export const readAdjectives = memoize(
  async () => await readJson(`${__dirname}/data.json`)
)
