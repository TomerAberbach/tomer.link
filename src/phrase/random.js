import randomNumber from 'random-number-csprng'

const random = async values => values[await randomNumber(0, values.length - 1)]

export default random
