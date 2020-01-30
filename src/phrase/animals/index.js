import memoize from 'mem'
import { readJson } from 'fs-extra'

export const readAnimals = memoize(
  async () => await readJson(`${__dirname}/data.json`)
)
