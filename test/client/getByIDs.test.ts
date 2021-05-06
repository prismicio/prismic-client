import test from 'ava'
import * as mswNode from 'msw/node'

import { createMockQueryHandler } from '../__testutils__/createMockQueryHandler'
import { createMockRepositoryHandler } from '../__testutils__/createMockRepositoryHandler'
import { createTestClient } from '../__testutils__/createClient'
import { createQueryResponsePages } from '../__testutils__/createQueryResponsePages'

import * as prismic from '../../src'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('returns matching documents from paginated response', async (t) => {
  const pagedResponses = createQueryResponsePages({
    numPages: 2,
    numDocsPerPage: 2,
  })
  const allDocs = pagedResponses.flatMap((page) => page.results)

  server.use(
    createMockRepositoryHandler(t),
    createMockQueryHandler(t, pagedResponses, undefined, {
      ref: 'masterRef',
      q: `[[at(document.id, [${allDocs
        .map((doc) => `"${doc.id}"`)
        .join(', ')}])]]`,
      pageSize: 100,
    }),
  )

  const client = createTestClient(t)
  const res = await client.getByIDs(allDocs.map((doc) => doc.id))

  t.deepEqual(res, allDocs)
  t.is(res.length, 2 * 2)
})

test('includes params if provided', async (t) => {
  const params: prismic.BuildQueryURLArgs = {
    accessToken: 'custom-accessToken',
    ref: 'custom-ref',
    lang: '*',
  }
  const pagedResponses = createQueryResponsePages({
    numPages: 2,
    numDocsPerPage: 2,
  })
  const allDocs = pagedResponses.flatMap((page) => page.results)

  server.use(
    createMockRepositoryHandler(t),
    createMockQueryHandler(t, pagedResponses, params.accessToken, {
      ref: params.ref as string,
      q: `[[at(document.id, [${allDocs
        .map((doc) => `"${doc.id}"`)
        .join(', ')}])]]`,
      pageSize: 100,
      lang: params.lang,
    }),
  )

  const client = createTestClient(t)
  const res = await client.getByIDs(
    allDocs.map((doc) => doc.id),
    params,
  )

  t.deepEqual(res, allDocs)
  t.is(res.length, 2 * 2)
})
