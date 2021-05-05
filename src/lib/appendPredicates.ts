interface WithPredicates {
  predicates?: string | string[]
}

export const appendPredicates = <T extends WithPredicates>(
  ...predicates: string[]
) => (params: T = {} as T): T => ({
  ...params,
  predicates: [params.predicates || [], ...predicates].flat(),
})
