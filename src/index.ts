import { Client } from './client'
import { getEndpoint } from './getEndpoint'

const endpoint = getEndpoint('my-repo')
const client = new Client(endpoint)
