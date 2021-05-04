export const castArray = <A>(a: A | A[]): A[] => (Array.isArray(a) ? a : [a])
