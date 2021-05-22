import * as prismic from '@prismicio/client'
import got from 'got'

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  // Here, we provide a way for the client to make network requests.
  // Got is one way to make network requests on the server. It has built-in
  // caching and automatically retries requests on failures.
  fetch: async (url, options) => {
    return await got(url, options).json()
  },
})

const homepage = await client.getByUID('page', 'home')
console.log(homepage)
// => The `page` document with a UID of `home`
