import exec from 'execa'

const git = (...args) => exec(`git`, args)

export const pull = () => git(`pull`)

export const commit = message => git(`-a`, `-m`, message)

export const push = () => git(`push`)
