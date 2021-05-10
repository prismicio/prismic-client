import * as ava from 'ava'
import * as crypto from 'crypto'
import fetch from 'node-fetch'

import * as prismic from '../../src'

export const createTestClient = (
  t: ava.ExecutionContext,
  options?: Parameters<typeof prismic.createClient>[1],
): prismic.Client => {
  const repositoryName = crypto.createHash('md5').update(t.title).digest('hex')
  const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const resolvedOptions: prismic.ClientConfig = {
    // TODO: Need to figure out how to widen the type of fetch to ensure users
    // can provide their own fetch functio nwithout type issues.
    // @ts-expect-error - The types for Fetch and node-fetch do not match
    fetch,
    ...options,
  }

  return prismic.createClient(endpoint, resolvedOptions)
}
