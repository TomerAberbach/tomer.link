import { URL } from 'url'

export const isSimplePath = string => {
  if (string.lastIndexOf('/') !== 0 || string.indexOf(`*`) !== -1) {
    return false
  }

  try {
    const url = new URL(string, `https://example.com`)
    return (
      [`username`, `password`, `port`, `search`, `hash`].every(
        field => url[field].length === 0
      ) && url.pathname.length > 1
    )
  } catch {
    return false
  }
}

export const isURL = string => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export const isRedirect = string => {
  const parts = string.split(/\s+/g)

  if (parts.length !== 2) {
    return false
  }

  const [from, to] = parts

  return isSimplePath(from) && isURL(to)
}
