import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint)

const homepage = await client.getByUID('page', 'home')
console.log(homepage)
// => The `page` document with a UID of `home`
