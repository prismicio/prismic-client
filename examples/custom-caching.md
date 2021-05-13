# Custom Caching

`@prismicio/client` makes requests to the Prismic REST API each time a query for
your content is made. If you use the `getEndpoint()` function to create your
client's API endpoint, you will utilize Prismic's API content delivery network
(CDN) which will ensure queries are returned efficiently.

To be even more efficient, however, you can utilize caching to limit the number
of network requests made. If you request the same query twice, for example, a
client setup with caching will only make one network request on the first query.

In the browser, this functionality is enabled by default. By using the global
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
function, browsers will automatically utilize their caching mechanism.

On the server, caching depends on the implementation of `fetch` provided to the
`createClient()` function. If you use a library like
[Got](https://github.com/sindresorhus/got) with caching built-in, you're already
good to go! If you utilize something lower-level like
[`node-fetch`][node-fetch], you will need to setup custom caching.

Custom caching is not limited to server usage. If your application requires a
specialized caching setup, or you have a framework-level cache available, custom
caching can be used even in the browser.

In most cases, using the browser's built-in cache or a pre-made `fetch()`
library with caching built-in is recommended. Doing so will work as expected
with minimal maintenance.

## Basic example

The following example shows a simple in-memory cache with no expiration. This
works well for short-lived processes, like a website or an
[AWS Lambda](https://aws.amazon.com/lambda/) function.

```typescript
import * as prismic from 'prismic'

// A very basic in-memory cache.
const cache = new Map()

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  fetch: async (url, options) => {
    // The cache key contains the requested URL and headers
    const key = JSON.stringify({ url, options })

    if (cache.has(key)) {
      // If the cache contains a value for the key, return it
      return cache.get(key)
    } else {
      // Otherwise, make the network request
      const res = await fetch(url, options)

      if (res.ok) {
        // If the request was successful, save it to the cache
        cache.set(key, res)
      }

      return res
    }
  },
})
```

**Note**: This example uses `fetch()` from the global scope. If your environment
does not include a global `fetch()` function, such as Node.js, be sure to import
one from a package like [`node-fetch`][node-fetch].

## Advanced example

The following example shows how to use a standalone caching system. In this
case, we're using a third-party package called
[`quick-lru`](https://github.com/sindresorhus/quick-lru), but the general
concept can be applied to any cache.

By using a more advanced cache, we can set parameters around its functionality
like a maximum age for an entry and total memory usage.

```typescript
import * as prismic from 'prismic'
import QuickLRU from 'quick-lru'

const cache = new QuickLRU({
  maxAge: 10000, // 10 seconds
  maxSize: 1000, // 1000 entries
})

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  fetch: async (url, options) => {
    // The cache key contains the requested URL and headers
    const key = JSON.stringify({ url, options })

    if (cache.has(key)) {
      // If the cache contains a value for the key, return it
      return cache.get(key)
    } else {
      // Otherwise, make the network request
      const res = await fetch(url, options)

      if (res.ok) {
        // If the request was successful, save it to the cache
        cache.set(key, res)
      }

      return res
    }
  },
})
```

**Note**: This example uses `fetch()` from the global scope. If your environment
does not include a global `fetch()` function, such as Node.js, be sure to import
one from a package like [`node-fetch`][node-fetch].

[node-fetch]: https://github.com/node-fetch/node-fetch
