# Server usage

This library works in the browser and the server. When using it on the server,
usage of the library requires two extra pieces of setup.

1. **Provide a `fetch()` function**<br/>By default, the library uses the global
   `fetch()` function to make network requests. In environments where `fetch()`
   is not available, such as Node.js, a `fetch()`-compatible function must be
   provided.

2. **Enable preview session support by providing a server `req` object**<br/>The
   library is able to provide automatic preview session support, which requires
   reading a session's cookies and URL parameters. In a server environment, such
   as one using [Express](https://expressjs.com/) or
   [Next.js](https://nextjs.org/), the `req` object contains this data.

## Providing a `fetch()` function

When creating a client, provide a `fetch()`-compatible function to the `fetch`
option.

```typescript
import * as prismic from 'prismic'
import fetch from 'make-fetch-happen'

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  fetch: fetch.defaults({ cacheManager: './.cache/prismic' }),
})
```

[`make-fetch-happen`](https://github.com/zkat/make-fetch-happen) is an
open-source package built upon the popular
[`node-fetch`](https://github.com/node-fetch/node-fetch) package. Among other
enhancements, it provides built-in caching support to ensure efficient API
requests.

In the above example, we're configuring `make-fetch-happen` to use
`./.cache/prismic` as the directory to store cached results in the filesystem.

If your use case requires customizing the network request functionality, such as
custom fetching or proxying, the `fetch` option can be customized.

```typescript
import * as prismic from 'prismic'
import fetch from 'make-fetch-happen'

// A very basic in-memory cache.
const cache = new Map()

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  fetch: async (url, options) => {
    const key = JSON.stringify({ url, options })

    if (cache.has(key)) {
      return cache.get(key)
    } else {
      const res = await fetch(url, options)

      cache.set(key, res)

      return res
    }
  },
})
```
