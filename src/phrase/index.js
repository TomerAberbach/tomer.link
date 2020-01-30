import random from './random'
import { readAdjectives } from './adjectives'
import { readAnimals } from './animals'
import { readRedirects, ruleExists } from '../redirects'

export const randomPhrase = async () => {
  const [adjective, animal] = await Promise.all(
    [readAdjectives, readAnimals].map(async read => random(await read()))
  )

  return `${adjective}-${animal}`
}

export const randomUniquePhrase = async () => {
  const { rules } = await readRedirects()
  let phrase

  do {
    phrase = await randomPhrase()
  } while (ruleExists({ rules, path: `/${phrase}` }))

  return phrase
}
