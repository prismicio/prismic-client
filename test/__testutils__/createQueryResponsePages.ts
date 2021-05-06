import * as prismic from '../../src'

import { createDocument } from './createDocument'
import { createQueryResponse } from './createQueryResponse'

type CreateQueryResponsePagesArgs<TData = Record<string, unknown>> = {
  numPages?: number
  numDocsPerPage?: number
  fields?: Partial<prismic.Document<TData>>
}

export const createQueryResponsePages = <
  TData extends Record<string, unknown> = Record<string, unknown>
>({
  numPages = 20,
  numDocsPerPage = 20,
  fields,
}: CreateQueryResponsePagesArgs<TData>): prismic.Query[] => {
  const documents = Array(numDocsPerPage)
    .fill(undefined)
    .map(() => createDocument(fields))

  return Array(numPages)
    .fill(undefined)
    .map((_, i, arr) =>
      createQueryResponse(documents, {
        page: i + 1,
        total_pages: arr.length,
      }),
    )
}
