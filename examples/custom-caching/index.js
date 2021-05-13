import { client } from './prismic'

const homepage = await client.getByUID('page', 'home')

console.log(homepage.data)
