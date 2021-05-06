import test from 'ava'
import * as mswNode from 'msw/node'

import { createMockRepositoryHandler } from './__testutils__/createMockRepositoryHandler'
import { createRepositoryResponse } from './__testutils__/createRepositoryResponse'
import { createTestClient } from './__testutils__/createClient'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('returns all tags', async (t) => {
  const response = createRepositoryResponse()
  server.use(createMockRepositoryHandler(t, response))

  const client = createTestClient(t)
  const res = await client.getTags()

  t.deepEqual(res, response.tags)
})
