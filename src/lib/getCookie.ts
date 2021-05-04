const readValue = (value: string): string => {
  return value.replace(/%3B/g, ';')
}

export const parse = (cookieString: string): { [name: string]: string } => {
  const result: { [name: string]: string } = {}
  const cookies = cookieString ? cookieString.split('; ') : []

  for (const cookie of cookies) {
    const parts = cookie.split('=')
    const value = parts.slice(1).join('=')
    const name = readValue(parts[0]).replace(/%3D/g, '=')
    result[name] = readValue(value)
  }

  return result
}

const getAll = (cookieStore: string): { [name: string]: string } =>
  parse(cookieStore)

export const getCookie = (
  name: string,
  cookieStore: string,
): string | undefined => getAll(cookieStore)[name]
