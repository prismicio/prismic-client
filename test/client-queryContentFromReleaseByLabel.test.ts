import test from 'ava'
import * as mswNode from 'msw/node'

import { createMockQueryHandler } from './__testutils__/createMockQueryHandler'
import { createMockRepositoryHandler } from './__testutils__/createMockRepositoryHandler'
import { createQueryResponse } from './__testutils__/createQueryResponse'
import { createTestClient } from './__testutils__/createClient'
import { createRepositoryResponse } from './__testutils__/createRepositoryResponse'
import { createRef } from './__testutils__/createRef'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('uses persisted releases ref for all future queries', async (t) => {
  const queryResponse = createQueryResponse()

  const ref1 = createRef()
  const repositoryResponse1 = createRepositoryResponse({ refs: [ref1] })
  server.use(
    createMockRepositoryHandler(t, repositoryResponse1),
    createMockQueryHandler(t, [queryResponse], undefined, {
      ref: ref1.ref,
    }),
  )

  const client = createTestClient(t)

  // We tell the client to use the Release to query all content.
  await client.queryContentFromReleaseByLabel(ref1.label)
  const res1 = await client.get()

  t.deepEqual(res1, queryResponse)

  const ref2 = createRef(true)
  const repositoryResponse2 = createRepositoryResponse({ refs: [ref2] })
  server.use(createMockRepositoryHandler(t, repositoryResponse2))

  // Although a new master ref has been set (see `ref2`), the client will
  // continue using the previous ref.
  const res2 = await client.get()

  t.deepEqual(res2, queryResponse)
})
