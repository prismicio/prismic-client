import test from 'ava'
import * as sinon from 'sinon'

import * as prismic from '../src'

test('createClient creates a Client', (t) => {
  const endpoint = prismic.getEndpoint('qwerty')
  const client = prismic.createClient(endpoint, {
    fetch: sinon.stub(),
  })

  t.true(client instanceof prismic.Client)
})

test('client has correct default state', (t) => {
  const endpoint = prismic.getEndpoint('qwerty')
  const options: prismic.ClientConfig = {
    accessToken: 'accessToken',
    ref: 'ref',
    fetch: async () => new Response(),
    defaultParams: {
      lang: '*',
    },
  }
  const client = prismic.createClient(endpoint, options)

  t.is(client.endpoint, endpoint)
  t.is(client.accessToken, options.accessToken)
  t.is(client.ref, options.ref)
  t.is(client.fetchFn, options.fetch)
  t.is(client.httpRequest, undefined)
  t.is(client.defaultParams, options.defaultParams)
})

test('constructor throws if fetch is unavailable', (t) => {
  const endpoint = prismic.getEndpoint('qwerty')

  t.throws(() => prismic.createClient(endpoint), {
    message: /fetch implementation was not provided/,
  })
})

test('uses globalThis.fetch if available', (t) => {
  const endpoint = prismic.getEndpoint('qwerty')

  const existingFetch = globalThis.fetch

  globalThis.fetch = async () => new Response()

  t.notThrows(() => prismic.createClient(endpoint))

  globalThis.fetch = existingFetch
})
