import memoize from 'mem'
import pkgUp from 'pkg-up'
import path from 'path'

export const packagePath = memoize(pkgUp)

export const projectPath = memoize(async () =>
  path.dirname(await packagePath())
)

export const redirectsPath = memoize(async () =>
  path.join(await projectPath(), `_redirects`)
)
