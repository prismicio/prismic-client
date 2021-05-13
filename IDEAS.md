# Ideas

This document explores API ideas before they are implemented.

## Getting a repository URL endpoint

```typescript
import * as prismic from '@prismicio/client'

prismic.getEndpoint('repo-name')
// => https://repo-name.cdn.prismic.io/api/v2
```

The following example will not be used. If someone wants to create a more custom
endpoint URL, such as without the CDN or using `wroom.io`, it can be created
manually without `getEndpoint`.

```typescript
import * as prismic from '@prismicio/client'

prismic.getEndpoint('repo-name')
// => https://repo-name.cdn.prismic.io/api/v2

prismic.getEndpoint('repo-name', { type: 'wroom' })
// => https://repo-name.cdn.wroom.io/api/v2

prismic.getEndpoint('repo-name', { type: 'prismic' })
// => https://repo-name.cdn.prismic.io/api/v2

prismic.getEndpoint('repo-name', { cdn: false })
// => https://repo-name.prismic.io/api/v2
```

## Creating a client

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint)
```

**With an access token**

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
})
```

**With a custom fetcher**

By default, the client uses the global `fetch` function. If one does not exist,
e.g. in Node.js, a polyfill can be loaded or a custom `fetch` function provided.
This means the library does not need to implement its own HTTP client.

Custom caching can be implemented here as well.

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint, {
  fetch: async (uri: string, options: RequestInit) => {
    // Make a network request and return the results.
    // This is a fetch-compatible API.
  },
})
```

**With an explicit ref**

This is helpful for Releases or Preview sessions. By default, the master ref
will be used and fetched lazily on the first network request. If a ref is
provided, or a preview cookie is present, it will be used instead, saving an
extra network request.

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint, {
  ref: process.env.PRISMIC_REF,
})
```

## Querying for documents

**Using helper methods**

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
})

const document = await client.getByID('doc-id')
const document = await client.getByUID('blog_post', 'post-uid')
const document = await client.getSingle('settings')

/**
 * New methods
 */

const documents = await client.getAll()
const blogPosts = await client.getAllByType('blog_post')
const foodDocuments = await client.getByTag('Food')
const fooAndBarDocuments = await client.getByTags(['Foo', 'Bar'])

// All of these methods take in an last parameter to add to the underlying
// predicates and parameters.
const blogPosts = await client.getAllByType('blog_post', {
  predicates: prismic.predicates.at('document.tags', ['featured']),
  orderings: [
    { field: 'my.blog_post.date', order: 'desc' },
    { field: 'document.last_publication_date', order: 'desc' },
    'first_publication_date desc',
  ],
  // Total limit. If multiple network requests are made to get all documents in
  // this method, it would stop once it reached 100 documents, even if there are
  // more to fetch.
  limit: 100,
})
// the `q` REST API parameter effectively will contain:
//   prismic.predicates.at('document.type', 'blog_post')
//   prismic.predicates.at('document.tags', ['featured'])
```

**Using lower-level `query` method**

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('repo-name')
const client = prismic.createClient(endpoint, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
})

const response = await client.query({
  predicates: [
    prismic.predicates.at('document.type', 'blog_post'),
    prismic.predicates.at('document.tags', ['featured']),
  ],
  orderings: ['my.blog-post.date desc'],
})

// query() and get() are the same method.
// get() aligns better with other `get*` helper methods.
const response = await client.get({
  predicates: [
    prismic.predicates.at('document.type', 'blog_post'),
    prismic.predicates.at('document.tags', ['featured']),
  ],
  orderings: ['my.blog-post.date desc'],
})
```

## URL builders (manual REST API usage)

These builders are used by the client. Since they are being created anyway, we
can expose these to users who decide to use the REST API directly. This may
occur if passing around an object reference isn't possible, such as through
serialized protocols.

**Fetching repository metadata**

Note that there is no special function for this. The repository metadata is
fetched using end endpoint and setting a header with the access token, if
necessary.

```typescript
import * as prismic from '@prismicio/client'
import got from 'got'

const endpoint = prismic.getEndpoint('repo-name')
const repository = await got(endpoint, {
  headers: {
    Authorization: process.env.PRISMIC_ACCESS_TOKEN,
  },
}).json<prismic.Repository>()
```

**Querying the API**

Note that `ref` and `predicates` are listed alongside other query parameters
like `lang`. Less positional arguments leads to easier development due to named
parameters and less refactoring pitfalls.

```typescript
import * as prismic from '@prismicio/client'
import got from 'got'

const endpoint = prismic.getEndpoint('repo-name')
const repository = await got(endpoint, {
  headers: {
    Authorization: process.env.PRISMIC_ACCESS_TOKEN,
  },
}).json<prismic.Repository>()

const masterRef = repository.refs.find((ref) => ref.isMaster)

const queryURL = prismic.buildQueryURL(endpoint, {
  ref: masterRef,
  predicates: null,
  lang: '*',
})
const response = await got(queryURL, {
  headers: {
    Authorization: process.env.PRISMIC_ACCESS_TOKEN,
  },
}).json<prismic.Query>()
```

## Supporting a default import (but deprecated)

This is included simply to ease upgrading. Named exports leads to better
treeshaking.

```typescript
import Prismic from '@prismicio/client'
import * as prismic from '@prismicio/client'

import assert from 'assert/strict'

// Prismic contains all the same functions as importing from named exports.
// This import should be marked as deprecated and removed in v6.

for (const key in Prismic) {
  assert.equal(Prismic[key], prismic[key])
}
```

---

# Examples

- Create a client

- Basic querying

- Filtering and sorting

- Server usage

  - Provide Fetch
  - Enable automatic previews
    - Provide Express-compatible middleware

- Custom caching

- Previews
