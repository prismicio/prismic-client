import * as prismic from '@prismicio/client'
import got from 'got'

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint, {
  fetch: async (url, options) => {
    return await got(url, options).json()
  },
})

const homepage = await client.getByUID('page', 'home')
console.log(homepage)
// => The `page` document with a UID of `home`
