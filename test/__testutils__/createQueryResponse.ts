import * as prismic from '../../src'
import { createDocument } from './createDocument'

export const createQueryResponse = <TData extends Record<string, unknown>>(
  docs: prismic.Document<TData>[] = [createDocument(), createDocument()],
  overrides?: Partial<prismic.Query<prismic.Document<TData>>>,
): prismic.Query<prismic.Document<TData>> => ({
  page: 1,
  results_per_page: docs.length,
  results_size: docs.length,
  total_results_size: docs.length,
  total_pages: 1,
  next_page: '',
  prev_page: '',
  results: docs,
  ...overrides,
})
