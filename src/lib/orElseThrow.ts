export const orElseThrow = <T>(a: T | null | undefined, error: Error): T => {
  if (a == null) {
    throw error
  }

  return a
}
