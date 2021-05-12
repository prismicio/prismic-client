import test from 'ava'
import { Response } from 'node-fetch'

import * as prismic from '../src'

test('contains the request url, options, and response', (t) => {
  const response = new Response()
  const url = 'https://example.com'
  const options: RequestInit = { headers: { foo: 'bar' } }
  const error = new prismic.HTTPError(undefined, response, url, options)

  t.is(error.response, response)
  t.is(error.url, url)
  t.is(error.options, options)
})

test('reason can be provided', (t) => {
  const reason = 'reason'
  const error = new prismic.HTTPError(
    reason,
    new Response(),
    'https://example.com',
    {},
  )

  t.is(error.message, reason)
})

test('default reason contains status code', (t) => {
  const status = 500
  const error = new prismic.HTTPError(
    undefined,
    new Response(undefined, { status }),
    'https://example.com',
    {},
  )

  t.true(/status code 500/.test(error.message))
})
