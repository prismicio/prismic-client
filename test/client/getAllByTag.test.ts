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

test('returns all documents by tag from paginated response', async (t) => {
  const documentTag = 'foo'
  const pagedResponses = createQueryResponsePages({
    numPages: 20,
    numDocsPerPage: 20,
    fields: { tags: [documentTag] },
  })
  const allDocs = pagedResponses.flatMap((page) => page.results)

  server.use(
    createMockRepositoryHandler(t),
    createMockQueryHandler(t, pagedResponses, undefined, {
      ref: 'masterRef',
      q: `[[at(document.tags, "${documentTag}")]]`,
      pageSize: 100,
    }),
  )

  const client = createTestClient(t)
  const res = await client.getAllByTag(documentTag)

  t.deepEqual(res, allDocs)
  t.is(res.length, 20 * 20)
})

test('includes params if provided', async (t) => {
  const params: prismic.BuildQueryURLArgs = {
    accessToken: 'custom-accessToken',
    ref: 'custom-ref',
    lang: '*',
  }
  const documentTag = 'foo'
  const pagedResponses = createQueryResponsePages({
    numPages: 20,
    numDocsPerPage: 20,
    fields: { tags: [documentTag] },
  })
  const allDocs = pagedResponses.flatMap((page) => page.results)

  server.use(
    createMockRepositoryHandler(t),
    createMockQueryHandler(t, pagedResponses, params.accessToken, {
      ref: params.ref as string,
      q: `[[at(document.tags, "${documentTag}")]]`,
      pageSize: 100,
      lang: params.lang,
    }),
  )

  const client = createTestClient(t)
  const res = await client.getAllByTag(documentTag, params)

  t.deepEqual(res, allDocs)
  t.is(res.length, 20 * 20)
})
