import memoize from 'mem'
import { readJson } from 'fs-extra'

export const readAnimals = memoize(() => readJson(`${process.cwd()}/data/animals.json`))
