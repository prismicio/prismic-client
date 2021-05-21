import * as prismic from '@prismicio/client'
import QuickLRU from 'quick-lru'

const endpoint = prismic.getEndpoint('my-repo')
const cache = new QuickLRU({
  maxAge: 10000, // 10 seconds
  maxSize: 1000, // 1000 entries
})

export const client = prismic.createClient(endpoint, {
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

const homepage = await client.getByUID('page', 'home')
console.log(homepage)
// => The `page` document with a UID of `home`

const homepageFetchedAgain = await client.getByUID('page', 'home')
console.log(homepageFetchedAgain)
// => This call will use the cache rather than make another network request.
